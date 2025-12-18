from django.shortcuts import get_object_or_404, render
from users.models import ClerkProfile
from rest_framework import viewsets,status, filters
from .serializers import FreelancerListSerializer, JobSerializer, ProfessionSerializer, ReviewSerializer, ReviewReplySerializer, TestimonialSerializer, FreelancerDetailSerializer, FreelancerSerializer, MpesaTransactionSerializer
from rest_framework.response import Response
from rest_framework.views import APIView   
from .models import Freelancer, Job, Review, Testimonial, Profession, ReviewHelpful, MpesaTransaction, Freelancer
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser  
from users.authentication import ClerkAuthentication  
from users.utils import get_or_create_freelancer
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError   
import requests,datetime,base64, logging
from django.views.decorators.csrf import csrf_exempt
from svix.webhooks import Webhook, WebhookVerificationError
from django.utils.decorators import method_decorator
from requests.auth import HTTPBasicAuth
from rest_framework.generics import ListAPIView, ListCreateAPIView
from django.conf import settings
from datetime import datetime
import logging  
from django.db import transaction
import json  


# Create your views here.
#
User = get_user_model()
logger = logging.getLogger(__name__)

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

    # def get_permissions(self):
    #     # Allow anyone to view reviews
    #     if self.action in ["list", "retrieve"]:
    #         return [AllowAny()]

    #     # Only authenticated users can create reviews
    #     if self.action in ["create", "perform_create", "mark_helpful", "add_reply"]:
    #         return [IsAuthenticated()]

    #     return [AllowAny()]

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

def get_access_token():
    """
    Fetches a new M-Pesa API access token using the consumer key and secret.
    """
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    try:
        consumer_key = settings.MPESA_CONFIG['CONSUMER_KEY']
        consumer_secret = settings.MPESA_CONFIG['CONSUMER_SECRET']

        if not consumer_key or not consumer_secret:
            raise ValueError("CONSUMER_KEY or CONSUMER_SECRET not found in settings.")

        # M-Pesa API endpoint for fetching the access token
        url = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
        
        # Use HTTP Basic Authentication to send the consumer key and secret
        response = requests.get(url, auth=HTTPBasicAuth(consumer_key, consumer_secret))
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        access_token = response.json().get('access_token')
        if not access_token:
            raise ValueError("Access token not found in API response.")

        return access_token

    except requests.exceptions.RequestException as e:
        print(f"Failed to get M-Pesa access token: {e}")
        return None
    except ValueError as e:
        print(f"Error getting M-Pesa access token: {e}")
        return None

class MpesaSTKPushAPIView(APIView):
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        # 1. First, get a new access token
        access_token = get_access_token()
        if not access_token:
            return Response(
                {"error": "Could not get an M-Pesa access token."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        clerk_id = request.data.get('clerk_id')

        # 2. Validate incoming data from the frontend
        try:
            phone_number = request.data.get('phone_number')
            amount = request.data.get('amount')
            if not phone_number or not amount:
                return Response(
                    {"error": "Missing phone_number or amount in request body."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            amount = int(amount)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount provided."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 3. Generate the required security credentials
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
        password = base64.b64encode(
            f"{settings.MPESA_CONFIG['SHORTCODE']}{settings.MPESA_CONFIG['PASSKEY']}{timestamp}".encode('utf-8')
        ).decode('utf-8')

        # 4. Prepare the M-Pesa API payload
        payload = {
            "BusinessShortCode": settings.MPESA_CONFIG['SHORTCODE'],
            "Password": password,
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": amount,
            "PartyA": phone_number,
            "PartyB": settings.MPESA_CONFIG['SHORTCODE'],
            "PhoneNumber": phone_number,
            "CallBackURL": settings.MPESA_CONFIG['CALLBACK_URL'],
            "AccountReference": "MyCompany",
            "TransactionDesc": "Payment for an item"
        }

        # 5. Make the STK Push API request with the fetched access token
        try:
            response = requests.post(
                "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
                json=payload,
                headers={"Authorization": f"Bearer {access_token}"}
            )
            response.raise_for_status()
            
            response_data = response.json()
            MpesaTransaction.objects.create(
                merchant_request_id=response_data.get('MerchantRequestID'),
                checkout_request_id=response_data.get('CheckoutRequestID'),
                phone_number=phone_number,
                amount=amount,
                clerk_id=clerk_id

            )
            return Response(response_data, status=response.status_code)

        except requests.exceptions.RequestException as e:
            print(f"M-Pesa STK Push request failed: {e}")
            return Response(
                {"error": "Failed to connect to M-Pesa API. Check your network or API keys."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        except Exception as e:
            print(f"An unexpected error occurred: {e}")
            return Response(
                {"error": "An internal server error occurred."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MpesaCallbackAPIView(APIView):
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        callback_data = request.data.get('Body', {}).get('stkCallback', {})
        merchant_request_id = callback_data.get('MerchantRequestID')
        checkout_request_id = callback_data.get('CheckoutRequestID')
        result_code = callback_data.get('ResultCode')
        result_desc = callback_data.get('ResultDesc')
        
        if result_code == 0:
            callback_metadata = callback_data.get('CallbackMetadata', {}).get('Item', [])
            
            amount = None
            mpesa_receipt_number = None
            transaction_date = None
            phone_number = None

            for item in callback_metadata:
                if item['Name'] == 'Amount':
                    amount = item['Value']
                elif item['Name'] == 'MpesaReceiptNumber':
                    mpesa_receipt_number = item['Value']
                elif item['Name'] == 'TransactionDate':
                    transaction_date = datetime.strptime(str(item['Value']), '%Y%m%d%H%M%S')
                elif item['Name'] == 'PhoneNumber':
                    phone_number = item['Value']

            try:
                transaction = MpesaTransaction.objects.get(
                    merchant_request_id=merchant_request_id,
                    checkout_request_id=checkout_request_id
                )
                
                transaction.result_code = result_code
                transaction.result_desc = result_desc
                transaction.amount = amount
                transaction.mpesa_receipt_number = mpesa_receipt_number
                transaction.transaction_date = transaction_date
                transaction.phone_number = phone_number
                transaction.save()

                clerk_id = transaction.clerk_id
                print("clerk_id in callback:", clerk_id)
                print("ClerkProfile exists:", ClerkProfile.objects.filter(clerk_id=clerk_id).exists())

                if clerk_id:
                    try:
                        user = ClerkProfile.objects.get(clerk_id=clerk_id)
                        user.role = 'freelancer'  # or user.is_freelancer = True
                        user.save()
                        print(user.role)
                        update_clerk_role_to_freelancer(clerk_id)
                    except ClerkProfile.DoesNotExist:
                        print("User not found for clerk_id:", clerk_id)
                
                print(f"Successfully updated transaction: {mpesa_receipt_number}")

            except MpesaTransaction.DoesNotExist:
                print("Transaction record not found in database.")

        else:
            print(f"Transaction failed with ResultCode: {result_code}, Description: {result_desc}")
            try:
                transaction = MpesaTransaction.objects.get(
                    merchant_request_id=merchant_request_id,
                    checkout_request_id=checkout_request_id
                )
                transaction.result_code = result_code
                transaction.result_desc = result_desc
                transaction.save()
            except MpesaTransaction.DoesNotExist:
                print("Transaction record for failed request not found.")

        return Response({"ResultCode": 0, "ResultDesc": "Success"}, status=status.HTTP_200_OK)


class MpesaTransactionListAPIView(ListAPIView):
    """
    API view to list all M-Pesa transactions.
    """
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    queryset = MpesaTransaction.objects.all().order_by('-created_at')
    serializer_class = MpesaTransactionSerializer

class MpesaTransactionStatusAPIView(APIView):
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    authentication_classes = []  # ✅ Disable Clerk auth for this view
    permission_classes = [AllowAny]
    def get(self, request, checkout_request_id, *args, **kwargs):
        try:
            # Find the transaction by its CheckoutRequestID
            mpesa_transaction = MpesaTransaction.objects.get(checkout_request_id=checkout_request_id)
            
            # Return the status based on the ResultCode
            if mpesa_transaction.result_code == "0":
                return Response({"status": "success"}, status=status.HTTP_200_OK)
            elif mpesa_transaction.result_code:
                # If there is a ResultCode, but it's not "0", it's a failure
                return Response({"status": "failed"}, status=status.HTTP_200_OK)
            else:
                # Still pending if no ResultCode is available
                return Response({"status": "pending"}, status=status.HTTP_200_OK)
        
        except MpesaTransaction.DoesNotExist:
            return Response({"status": "pending"}, status=status.HTTP_200_OK)
        except Exception as e:
            # Catch-all for any other unexpected error
            print(f"Error checking transaction status for ID {checkout_request_id}: {e}")
            return Response({"status": "error", "message": "An internal server error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
@csrf_exempt
def clerk_webhook_handler(request):
    print("Clerk webhook called")
    # Get the webhook signing secret from your environment variables
    # This secret is configured in your Clerk Dashboard
    webhook_secret = settings.MPESA_CONFIG['CLERK_WEBHOOK_SECRET']

    # Get webhook headers and payload from the request
    headers = request.headers
    payload = request.body.decode('utf-8')

    try:
        # Verify the webhook signature
        wh = Webhook(webhook_secret)
        evt = wh.verify(payload, headers)
    except WebhookVerificationError:
        print("Webhook verification failed.")
        return HttpResponse(status=400)
    
    event_type = evt.get("type")
    
    # Handle user creation or update robustly with error handling
    if event_type in ["user.created", "user.updated"]:
        user_data = evt.get("data", {})
        clerk_id = user_data.get("id")
        email = user_data.get("email_addresses", [{}])[0].get("email_address")
        first_name = user_data.get("first_name")
        last_name = user_data.get("last_name")
        public_metadata = user_data.get("public_metadata", {})
        role = public_metadata.get("role", "user")  # Default to 'default_role'

        try:
            user, created = ClerkProfile.objects.get_or_create(
                clerk_id=clerk_id,
                defaults={
                    "first_name": first_name,
                    "last_name": last_name,
                    "email": email,
                    "role": role,
                }
            )
            if not created:
                # Update fields if user already exists
                user.first_name = first_name
                user.last_name = last_name
                user.email = email
                user.role =role
                user.save()
                print(f"User updated: {clerk_id}")
            else:
                print(f"User created: {clerk_id}")
        except Exception as e:
            print("Error in Clerk webhook user creation:", e)

    # Handle user deletion
    elif event_type == "user.deleted":
        user_data = evt.get("data", {})
        clerk_id = user_data.get("id")
        ClerkProfile.objects.filter(clerk_id=clerk_id).delete()
        print(f"User deleted: {clerk_id}")

    return HttpResponse(status=200)


def update_clerk_role_to_freelancer(clerk_id):
    CLERK_API_KEY = settings.CLERK_SECRET_KEY
    if not CLERK_API_KEY:
        print("CLERK_SECRET_KEY not set in environment.")
        return

    headers = {
        "Authorization": f"Bearer {CLERK_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "public_metadata": {
            "role": "freelancer"
        }
    }
    resp = requests.patch(
        f"https://api.clerk.com/v1/users/{clerk_id}",
        headers=headers,
        json=data
    )
    print(f"Clerk API response: {resp.status_code} {resp.text}")