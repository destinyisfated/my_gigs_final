from django.shortcuts import get_object_or_404, render
from rest_framework import viewsets, status,filters
from .serializers import FreelancerListSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer, FreelancerDetailSerializer, FreelancerSerializer
from rest_framework.response import Response
from rest_framework.views import APIView   
from .models import Freelancer, Job, Review, Testimonial, Profession, ReviewHelpful, MpesaTransaction, Freelancer
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser  
from users.authentication import ClerkAuthentication  
from users.utils import get_or_create_freelancer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError   
import requests,datetime,base64, logging

# Create your views here.
#
User = get_user_model()
logger = logging.getLogger(__name__)

MPESA_CONSUMER_KEY = "SUqVYjC7urBNakAA4gQKAAaAKlNQaQRkjVMaATLqxRZTXG1b"
MPESA_CONSUMER_SECRET = "sVo3BH4k4qI0F5BA1P85Yy5EIvAHkGj8qxIEBJuxBjox8I8Ga5wUpss4JQ7e025N"
MPESA_SHORTCODE =str(174379)
MPESA_PASSKEY = str("bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919")
MPESA_BASE_URL = "https://sandbox.safaricom.co.ke"

def get_access_token():
    """Get OAuth token from MPESA API"""
    response = requests.get(
        f"{MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials",
        auth=(MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET)
    )
    response.raise_for_status()
    return response.json()["access_token"]

def generate_timestamp():
    return datetime.datetime.now().strftime("%Y%m%d%H%M%S")

def generate_password(shortcode, passkey, timestamp):
    # Ensure all parts are strings before concatenation
    raw_password = f"{passkey}{shortcode}{timestamp}"
    return base64.b64encode(raw_password.encode()).decode()

class MpesaSTKPushAPIView(APIView):
    """
    Initiates an STK Push request for subscription payment
    """

    def post(self, request, *args, **kwargs):
        phone_number = request.data.get("phone_number")
        amount = request.data.get("amount")
        clerk_id = request.data.get("clerk_id")

        if not all([phone_number, amount, clerk_id]):
            return Response(
                {"detail": "phone_number, amount, and clerk_id are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)  # ensure numeric
            timestamp = generate_timestamp()
            password = generate_password(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp)
            access_token = get_access_token()

            if not access_token:
                return Response({"detail": "MPESA access token is missing."}, status=500)

            # Create transaction record
            transaction = MpesaTransaction.objects.create(
                phone_number=phone_number,
                amount=amount,
                clerk_id=clerk_id
            )

            stkpush_url = f"{MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest"
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }

            payload = {
                "BusinessShortCode": MPESA_SHORTCODE,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": amount,
                "PartyA": str(phone_number),
                "PartyB": MPESA_SHORTCODE,
                "PhoneNumber": str(phone_number),
                "CallBackURL": request.build_absolute_uri("/api/mpesa/callback/"),
                "AccountReference": f"MyGigs-{clerk_id}",
                "TransactionDesc": "Freelancer subscription"
            }

            response = requests.post(stkpush_url, json=payload, headers=headers, timeout=30)
            response_data = response.json()

            # Save the request IDs to the transaction
            transaction.merchant_request_id = response_data.get("MerchantRequestID")
            transaction.checkout_request_id = response_data.get("CheckoutRequestID")
            transaction.save()

            return Response(response_data, status=status.HTTP_200_OK)

        except ValueError:
            return Response({"detail": "Invalid amount. Must be a number."}, status=400)

        except requests.exceptions.RequestException as e:
            logger.exception("MPESA STK Push failed")
            return Response({"detail": f"MPESA request failed: {str(e)}"}, status=500)

        except Exception as e:
            logger.exception("Unexpected error during MPESA STK Push")
            return Response({"detail": str(e)}, status=500)
class MpesaStatusAPIView(APIView):
    """
    Checks the status of the transaction for the given clerk_id.
    """

    def get(self, request):
        clerk_id = request.query_params.get("clerk_id")
        if not clerk_id:
            return Response({"detail": "clerk_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            transaction = MpesaTransaction.objects.filter(clerk_id=clerk_id).latest("created_at")
        except MpesaTransaction.DoesNotExist:
            return Response({"status": "idle"})

        if transaction.result_code == "0":
            return Response({"status": "successful"})
        elif transaction.result_code:
            return Response({"status": "failed"})
        else:
            return Response({"status": "pending"})

# class MpesaCallbackAPIView(APIView):
#     """
#     Called by MPESA to confirm transaction result.
#     """

#     def post(self, request):
#         callback_data = request.data
#         checkout_request_id = callback_data.get("Body", {}).get("stkCallback", {}).get("CheckoutRequestID")
#         result_code = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultCode")
#         result_desc = callback_data.get("Body", {}).get("stkCallback", {}).get("ResultDesc")
#         mpesa_receipt = callback_data.get("Body", {}).get("stkCallback", {}).get("CallbackMetadata", {}).get("Item", [{}])[1].get("Value")
#         transaction_date = callback_data.get("Body", {}).get("stkCallback", {}).get("CallbackMetadata", {}).get("Item", [{}])[0].get("Value")

#         try:
#             transaction = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
#             transaction.result_code = str(result_code)
#             transaction.result_desc = result_desc
#             transaction.mpesa_receipt_number = mpesa_receipt
#             transaction.transaction_date = transaction_date
#             transaction.save()
#         except MpesaTransaction.DoesNotExist:
#             pass

#         return Response({"ResultCode": 0, "ResultDesc": "Success"}, status=status.HTTP_200_OK)

class MpesaCallbackAPIView(APIView):
    """
    Handles M-Pesa payment callbacks.
    Updates the MpesaTransaction and upgrades the user to freelancer if payment successful.
    """
    def post(self, request, *args, **kwargs):
        data = request.data

        checkout_request_id = data.get("CheckoutRequestID")
        result_code = data.get("ResultCode")
        result_desc = data.get("ResultDesc")
        mpesa_receipt_number = data.get("MpesaReceiptNumber")
        amount = data.get("Amount")
        phone_number = data.get("PhoneNumber")
        transaction_date = data.get("TransactionDate")
        clerk_id = data.get("ClerkID")

        try:
            transaction = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
        except MpesaTransaction.DoesNotExist:
            return Response({"detail": "Transaction not found"}, status=status.HTTP_404_NOT_FOUND)

        # Update transaction details
        transaction.result_code = result_code
        transaction.result_desc = result_desc
        transaction.mpesa_receipt_number = mpesa_receipt_number
        transaction.amount = amount
        transaction.phone_number = phone_number
        transaction.transaction_date = transaction_date
        transaction.save()

        # If payment is successful, upgrade user
        if str(result_code) == "0" and clerk_id:
            try:
                user = User.objects.get(pk=clerk_id)  # assuming clerk_id matches Django user PK
                # Upgrade logic: create Freelancer object if not exists
                Freelancer.objects.get_or_create(user=user)
            except User.DoesNotExist:
                return Response({"detail": "User not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"ResultCode": 0, "ResultDesc": "Success"}, status=status.HTTP_200_OK)
class ProfessionViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve professions"""
    queryset = Profession.objects.filter(is_active=True)
    serializer_class = ProfessionSerializer
    
    @action(detail=True, methods=['get'])
    def freelancers(self, request, pk=None):
        """Get all freelancers for a specific profession"""
        profession = self.get_object()
        freelancers = profession.freelancers.filter(is_active=True)
        
        # Apply filters
        county = request.query_params.get('county')
        constituency = request.query_params.get('constituency')
        ward = request.query_params.get('ward')
        min_rating = request.query_params.get('min_rating')
        min_experience = request.query_params.get('min_experience')
        search = request.query_params.get('search')
        
        if county:
            freelancers = freelancers.filter(county__iexact=county)
        if constituency:
            freelancers = freelancers.filter(constituency__iexact=constituency)
        if ward:
            freelancers = freelancers.filter(ward__iexact=ward)
        if min_rating:
            freelancers = freelancers.filter(rating__gte=float(min_rating))
        if min_experience:
            freelancers = freelancers.filter(years_experience__gte=int(min_experience))
        if search:
            freelancers = freelancers.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search)
            )
        
        page = self.paginate_queryset(freelancers)
        serializer = FreelancerListSerializer(page, many=True)
        return self.get_paginated_response(serializer.data)


class FreelancerViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve freelancers"""
    queryset = Freelancer.objects.filter(is_active=True).select_related('profession')
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return FreelancerDetailSerializer
        return FreelancerListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filters
        profession = self.request.query_params.get('profession')
        county = self.request.query_params.get('county')
        constituency = self.request.query_params.get('constituency')
        ward = self.request.query_params.get('ward')
        min_rating = self.request.query_params.get('min_rating')
        min_experience = self.request.query_params.get('min_experience')
        search = self.request.query_params.get('search')
        
        if profession:
            queryset = queryset.filter(profession__id=profession)
        if county:
            queryset = queryset.filter(county__iexact=county)
        if constituency:
            queryset = queryset.filter(constituency__iexact=constituency)
        if ward:
            queryset = queryset.filter(ward__iexact=ward)
        if min_rating:
            queryset = queryset.filter(rating__gte=float(min_rating))
        if min_experience:
            queryset = queryset.filter(years_experience__gte=int(min_experience))
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(skills__icontains=search) |
                Q(profession__name__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured freelancers for homepage"""
        featured = self.get_queryset().filter(is_featured=True)[:8]
        serializer = FreelancerListSerializer(featured, many=True)
        return Response(serializer.data)


class FreelancerProfileUpdateView(APIView):
    authentication_classes = [ClerkAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(freelancer)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        freelancer = get_or_create_freelancer(request.user)
        serializer = FreelancerSerializer(freelancer, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    serializer_class = ReviewSerializer
    authentication_classes = [ClerkAuthentication]

    def get_permissions(self):
        # Allow anyone to view reviews
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]

        # Only authenticated users can create reviews
        if self.action in ["create", "perform_create", "mark_helpful", "add_reply"]:
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_queryset(self):
        freelancer_id = self.kwargs.get('freelancer_id')
        return Review.objects.filter(freelancer_id=freelancer_id).order_by('-created_at')

    def perform_create(self, serializer):
        print("Request data:", self.request.data)

        user = self.request.user
        if not user.is_authenticated:
            raise PermissionDenied("Authentication required")

        freelancer_id = self.kwargs.get('freelancer_id')
        freelancer = get_object_or_404(Freelancer, id=freelancer_id)

        # Compute client name & avatar
        client_name = f"{user.first_name} {user.last_name}".strip() or user.username
        client_avatar = "".join([part[0].upper() for part in client_name.split()[:2]])

        serializer.save(
            freelancer=freelancer,
            client=user,
            client_name=client_name,
            client_avatar=client_avatar,
            helpful_count=0
        )

    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_count += 1
        review.save()
        return Response({'helpful_count': review.helpful_count})

    @action(detail=True, methods=['post'])
    def add_reply(self, request, pk=None):
        review = self.get_object()
        serializer = ReviewReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review=review)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ReviewSerializer
    authentication_classes = [ClerkAuthentication]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        freelancer_id = (
            self.kwargs.get("freelancer_pk")
            or self.kwargs.get("freelancer_id")
        )

        if freelancer_id:
            return Review.objects.filter(
                freelancer_id=freelancer_id
            ).order_by("-created_at")

        return Review.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        freelancer_id = (
            self.kwargs.get("freelancer_pk")
            or self.kwargs.get("freelancer_id")
        )

        freelancer = get_object_or_404(Freelancer, id=freelancer_id)

        client_name = (
            f"{user.first_name} {user.last_name}".strip()
            or user.username
        )
        client_avatar = "".join(
            part[0].upper() for part in client_name.split()[:2]
        )

        serializer.save(
            freelancer=freelancer,
            client=user,
            client_name=client_name,
            client_avatar=client_avatar,
            helpful_count=0,
        )

    @action(detail=True, methods=["post"])
    def add_reply(self, request, pk=None):
        review = self.get_object()
        serializer = ReviewReplySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(review=review)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        user = request.user

        helpful, created = ReviewHelpful.objects.get_or_create(
            review=review,
            user=user
        )

        if not created:
            return Response(
                {"detail": "You already marked this review as helpful."},
                status=status.HTTP_400_BAD_REQUEST
            )

        review.helpful_count += 1
        review.save(update_fields=["helpful_count"])

        return Response(
            {"helpful_count": review.helpful_count},
            status=status.HTTP_200_OK
        )

class TestimonialViewSet(viewsets.ModelViewSet):
    serializer_class = TestimonialSerializer

    def get_queryset(self):
        user = self.request.user
        # Public users only see approved testimonials
        if self.request.user.is_staff:
            return Testimonial.objects.all().order_by("-created_at")
        if self.action in ["update", "partial_update", "destroy"]:
            return Testimonial.objects.filter(user=user)
        return Testimonial.objects.filter(is_approved=True).order_by("-created_at")

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        elif self.action == "create":
            return [IsAuthenticated()]
        return [IsAdminUser()]
    # def create(self, request, *args, **kwargs):
    #     user = request.user

    #     # 🚫 Rate-limit: only one testimonial per user
    #     if Testimonial.objects.filter(name__iexact=user.get_full_name()).exists():
    #         raise ValidationError({
    #             "detail": "You have already submitted a testimonial."
    #         })

    #     return super().create(request, *args, **kwargs)
    
    def perform_create(self, serializer):
        user = self.request.user

        name = f"{user.first_name} {user.last_name}".strip() or user.username
        avatar = "".join(part[0].upper() for part in name.split()[:2])

        serializer.save(
            user=user,
            name=name,
            avatar=avatar,
            is_approved=False  # always require moderation
        )


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

@api_view(["GET"])
@authentication_classes([ClerkAuthentication])
@permission_classes([IsAuthenticated])
def whoami(request):
    user = request.user
    return Response({
        "id": user.id,
        "email": user.email,
        "name": user.first_name,
        "clerk_id": user.username
    })



    # Replace with actual Daraja API call
    # Return mock structure for example
    return {
        "MerchantRequestID": "mock_merchant_id",
        "CheckoutRequestID": "mock_checkout_id",
        "ResponseCode": "0",
        "ResponseDescription": "Success"
    }



    def post(self, request):
        data = request.data
        try:
            callback = data["Body"]["stkCallback"]
            checkout_request_id = callback["CheckoutRequestID"]
            result_code = callback["ResultCode"]
            result_desc = callback["ResultDesc"]

            transaction = MpesaTransaction.objects.filter(checkout_request_id=checkout_request_id).first()
            if transaction:
                transaction.result_code = result_code
                transaction.result_desc = result_desc

                if result_code == 0:
                    items = callback["CallbackMetadata"]["Item"]
                    transaction.mpesa_receipt_number = next(item["Value"] for item in items if item["Name"]=="MpesaReceiptNumber")
                    transaction.transaction_date = next(item["Value"] for item in items if item["Name"]=="TransactionDate")
                    transaction.status = "successful"
                else:
                    transaction.status = "failed"
                transaction.save()
        except Exception as e:
            print("Callback Error:", e)

        return Response({"ResultCode": 0, "ResultDesc": "Success"}, status=status.HTTP_200_OK)
@api_view(["GET"])
def check_subscription(request):
    clerk_id = request.query_params.get("clerk_id")
    has_subscription = MpesaTransaction.objects.filter(
        clerk_id=clerk_id, status="successful"
    ).exists()
    return Response({"has_subscription": has_subscription})


@api_view(["GET"])
def transaction_status(request):
    transaction_id = request.query_params.get("transaction_id")
    transaction = MpesaTransaction.objects.filter(id=transaction_id).first()
    if transaction:
        return Response({"status": transaction.status})
    return Response({"status": "not_found"}, status=status.HTTP_404_NOT_FOUND)
