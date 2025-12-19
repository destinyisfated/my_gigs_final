// Referral & Sales Tracking API Documentation
// Backend: Django REST Framework

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ==================== DJANGO MODELS ====================
/*
# models.py

from django.db import models
from django.contrib.auth.models import User
import uuid

class SalesPerson(models.Model):
    """Sales/Marketing person with referral tracking"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='sales_profile')
    referral_code = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)  # percentage
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Analytics fields (can be computed but storing for performance)
    total_referrals = models.IntegerField(default=0)
    approved_referrals = models.IntegerField(default=0)
    paid_referrals = models.IntegerField(default=0)
    total_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    class Meta:
        db_table = 'sales_persons'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.referral_code})"
    
    def generate_referral_code(self):
        """Generate unique referral code"""
        import random, string
        while True:
            code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
            if not SalesPerson.objects.filter(referral_code=code).exists():
                return code


class Referral(models.Model):
    """Tracks client referrals from sales people"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Verification'),
        ('approved', 'Approved by Admin'),
        ('confirmed', 'Payment Received'),
        ('rejected', 'Rejected'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sales_person = models.ForeignKey(SalesPerson, on_delete=models.CASCADE, related_name='referrals')
    
    # Client/Freelancer information
    client_name = models.CharField(max_length=255)
    client_email = models.EmailField()
    client_phone = models.CharField(max_length=20, blank=True, null=True)
    client_user_id = models.IntegerField(null=True, blank=True)  # Link to User model after signup
    
    # Referral tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True)
    referral_code_used = models.CharField(max_length=20)
    
    # Payment tracking
    payment_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    commission_earned = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    payment_received_at = models.DateTimeField(null=True, blank=True)
    
    # Admin verification
    verified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='verified_referrals')
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional notes
    notes = models.TextField(blank=True, null=True)
    
    class Meta:
        db_table = 'referrals'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sales_person', 'status']),
            models.Index(fields=['client_email']),
            models.Index(fields=['referral_code_used']),
        ]
    
    def __str__(self):
        return f"{self.client_name} -> {self.sales_person.name} ({self.status})"
    
    def calculate_commission(self):
        """Calculate commission based on payment amount and sales person rate"""
        if self.payment_amount and self.sales_person:
            self.commission_earned = (self.payment_amount * self.sales_person.commission_rate) / 100
            return self.commission_earned
        return 0


class ReferralPayment(models.Model):
    """Tracks payments from referred clients"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referral = models.ForeignKey(Referral, on_delete=models.CASCADE, related_name='payments')
    
    payment_id = models.CharField(max_length=255)  # External payment ID (Stripe, M-Pesa, etc)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=50)  # 'stripe', 'mpesa', etc
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'referral_payments'
        ordering = ['-created_at']
*/

// ==================== SERIALIZERS ====================
/*
# serializers.py

from rest_framework import serializers
from .models import SalesPerson, Referral, ReferralPayment

class SalesPersonSerializer(serializers.ModelSerializer):
    class Meta:
        model = SalesPerson
        fields = [
            'id', 'name', 'email', 'phone', 'referral_code',
            'commission_rate', 'is_active', 'created_at',
            'total_referrals', 'approved_referrals', 'paid_referrals', 'total_earnings'
        ]
        read_only_fields = ['id', 'referral_code', 'total_referrals', 'approved_referrals', 
                           'paid_referrals', 'total_earnings', 'created_at']

class ReferralSerializer(serializers.ModelSerializer):
    sales_person_name = serializers.CharField(source='sales_person.name', read_only=True)
    sales_person_code = serializers.CharField(source='sales_person.referral_code', read_only=True)
    
    class Meta:
        model = Referral
        fields = [
            'id', 'sales_person', 'sales_person_name', 'sales_person_code',
            'client_name', 'client_email', 'client_phone', 'client_user_id',
            'status', 'referral_code_used', 'payment_amount', 'commission_earned',
            'payment_received_at', 'verified_by', 'verified_at', 'rejection_reason',
            'created_at', 'updated_at', 'notes'
        ]
        read_only_fields = ['id', 'commission_earned', 'verified_at', 'payment_received_at', 
                           'created_at', 'updated_at']

class ReferralPaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReferralPayment
        fields = ['id', 'referral', 'payment_id', 'amount', 'payment_method', 'created_at']
        read_only_fields = ['id', 'created_at']
*/

// ==================== VIEWSETS ====================
/*
# views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Sum, Count, Q
from django.utils import timezone
from .models import SalesPerson, Referral, ReferralPayment
from .serializers import SalesPersonSerializer, ReferralSerializer, ReferralPaymentSerializer

class SalesPersonViewSet(viewsets.ModelViewSet):
    queryset = SalesPerson.objects.all()
    serializer_class = SalesPersonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        # Only admins can create/update/delete sales people
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return [IsAuthenticated()]
    
    def perform_create(self, serializer):
        # Auto-generate referral code
        sales_person = serializer.save()
        if not sales_person.referral_code:
            sales_person.referral_code = sales_person.generate_referral_code()
            sales_person.save()
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get detailed stats for a sales person"""
        sales_person = self.get_object()
        
        referrals = sales_person.referrals.all()
        
        stats = {
            'total_referrals': referrals.count(),
            'pending_referrals': referrals.filter(status='pending').count(),
            'approved_referrals': referrals.filter(status='approved').count(),
            'confirmed_referrals': referrals.filter(status='confirmed').count(),
            'rejected_referrals': referrals.filter(status='rejected').count(),
            'total_earnings': referrals.filter(status='confirmed').aggregate(
                total=Sum('commission_earned')
            )['total'] or 0,
            'total_revenue': referrals.filter(status='confirmed').aggregate(
                total=Sum('payment_amount')
            )['total'] or 0,
        }
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def referrals(self, request, pk=None):
        """Get all referrals for a sales person"""
        sales_person = self.get_object()
        referrals = sales_person.referrals.all()
        
        # Filter by status if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            referrals = referrals.filter(status=status_filter)
        
        serializer = ReferralSerializer(referrals, many=True)
        return Response(serializer.data)


class ReferralViewSet(viewsets.ModelViewSet):
    queryset = Referral.objects.select_related('sales_person').all()
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Sales people can only see their own referrals
        if not self.request.user.is_staff:
            try:
                sales_person = SalesPerson.objects.get(user=self.request.user)
                queryset = queryset.filter(sales_person=sales_person)
            except SalesPerson.DoesNotExist:
                queryset = queryset.none()
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """Admin approves a referral"""
        referral = self.get_object()
        
        if referral.status != 'pending':
            return Response(
                {'error': 'Only pending referrals can be approved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        referral.status = 'approved'
        referral.verified_by = request.user
        referral.verified_at = timezone.now()
        referral.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """Admin rejects a referral"""
        referral = self.get_object()
        
        if referral.status not in ['pending', 'approved']:
            return Response(
                {'error': 'Cannot reject confirmed referrals'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        referral.status = 'rejected'
        referral.verified_by = request.user
        referral.verified_at = timezone.now()
        referral.rejection_reason = request.data.get('reason', '')
        referral.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def record_payment(self, request, pk=None):
        """Record a payment for a referral (moves to confirmed status)"""
        referral = self.get_object()
        
        if referral.status != 'approved':
            return Response(
                {'error': 'Referral must be approved before recording payment'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_amount = request.data.get('amount')
        payment_id = request.data.get('payment_id')
        payment_method = request.data.get('payment_method', 'unknown')
        
        if not payment_amount or not payment_id:
            return Response(
                {'error': 'Amount and payment_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update referral
        referral.payment_amount = payment_amount
        referral.calculate_commission()
        referral.status = 'confirmed'
        referral.payment_received_at = timezone.now()
        referral.save()
        
        # Create payment record
        ReferralPayment.objects.create(
            referral=referral,
            payment_id=payment_id,
            amount=payment_amount,
            payment_method=payment_method
        )
        
        # Update sales person stats
        sales_person = referral.sales_person
        sales_person.paid_referrals += 1
        sales_person.total_earnings += referral.commission_earned or 0
        sales_person.save()
        
        serializer = self.get_serializer(referral)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def verify_code(self, request):
        """Verify if a referral code is valid"""
        code = request.data.get('code', '').upper()
        
        try:
            sales_person = SalesPerson.objects.get(referral_code=code, is_active=True)
            return Response({
                'valid': True,
                'sales_person': {
                    'id': str(sales_person.id),
                    'name': sales_person.name,
                    'code': sales_person.referral_code
                }
            })
        except SalesPerson.DoesNotExist:
            return Response({'valid': False}, status=status.HTTP_404_NOT_FOUND)


class AdminDashboardViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """Get overall platform stats"""
        total_sales = SalesPerson.objects.filter(is_active=True).count()
        total_referrals = Referral.objects.count()
        
        stats = {
            'total_sales_people': total_sales,
            'total_referrals': total_referrals,
            'pending_referrals': Referral.objects.filter(status='pending').count(),
            'approved_referrals': Referral.objects.filter(status='approved').count(),
            'confirmed_referrals': Referral.objects.filter(status='confirmed').count(),
            'total_revenue': Referral.objects.filter(status='confirmed').aggregate(
                total=Sum('payment_amount')
            )['total'] or 0,
            'total_commissions': Referral.objects.filter(status='confirmed').aggregate(
                total=Sum('commission_earned')
            )['total'] or 0,
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def leaderboard(self, request):
        """Get top performing sales people"""
        sales_people = SalesPerson.objects.filter(is_active=True).order_by('-total_earnings')[:10]
        serializer = SalesPersonSerializer(sales_people, many=True)
        return Response(serializer.data)
*/

// ==================== URL ROUTING ====================
/*
# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SalesPersonViewSet, ReferralViewSet, AdminDashboardViewSet

router = DefaultRouter()
router.register(r'sales-persons', SalesPersonViewSet, basename='salesperson')
router.register(r'referrals', ReferralViewSet, basename='referral')
router.register(r'admin-dashboard', AdminDashboardViewSet, basename='admin-dashboard')

urlpatterns = [
    path('', include(router.urls)),
]

# This creates the following endpoints:
# GET/POST    /api/sales-persons/
# GET/PUT     /api/sales-persons/{id}/
# GET         /api/sales-persons/{id}/stats/
# GET         /api/sales-persons/{id}/referrals/
# 
# GET/POST    /api/referrals/
# GET/PUT     /api/referrals/{id}/
# POST        /api/referrals/{id}/approve/
# POST        /api/referrals/{id}/reject/
# POST        /api/referrals/{id}/record_payment/
# POST        /api/referrals/verify_code/
#
# GET         /api/admin-dashboard/overview/
# GET         /api/admin-dashboard/leaderboard/
*/

// ==================== FRONTEND API FUNCTIONS ====================

export interface SalesPerson {
  id: string;
  name: string;
  email: string;
  phone?: string;
  referral_code: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
  total_referrals: number;
  approved_referrals: number;
  paid_referrals: number;
  total_earnings: number;
}

export interface Referral {
  id: string;
  sales_person: string;
  sales_person_name: string;
  sales_person_code: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  client_user_id?: number;
  status: "pending" | "approved" | "confirmed" | "rejected";
  referral_code_used: string;
  payment_amount?: number;
  commission_earned?: number;
  payment_received_at?: string;
  verified_by?: number;
  verified_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface SalesStats {
  total_referrals: number;
  pending_referrals: number;
  approved_referrals: number;
  confirmed_referrals: number;
  rejected_referrals: number;
  total_earnings: number;
  total_revenue: number;
}

export interface AdminOverview {
  total_sales_people: number;
  total_referrals: number;
  pending_referrals: number;
  approved_referrals: number;
  confirmed_referrals: number;
  total_revenue: number;
  total_commissions: number;
}

// ==================== API CALLS ====================

export const referralApi = {
  // Sales Person endpoints
  getAllSalesPeople: async (): Promise<SalesPerson[]> => {
    // const response = await fetch(`${API_BASE_URL}/sales-persons/`);
    // return response.json();

    // Mock data for now
    return [
      {
        id: "1",
        name: "John Kamau",
        email: "john@sales.com",
        phone: "+254712345678",
        referral_code: "KAMAU001",
        commission_rate: 10,
        is_active: true,
        created_at: "2024-01-15",
        total_referrals: 15,
        approved_referrals: 12,
        paid_referrals: 8,
        total_earnings: 45000,
      },
      {
        id: "2",
        name: "Mary Njeri",
        email: "mary@sales.com",
        phone: "+254723456789",
        referral_code: "NJERI002",
        commission_rate: 12,
        is_active: true,
        created_at: "2024-02-20",
        total_referrals: 23,
        approved_referrals: 20,
        paid_referrals: 15,
        total_earnings: 78000,
      },
    ];
  },

  getSalesPersonById: async (id: string): Promise<SalesPerson> => {
    // const response = await fetch(`${API_BASE_URL}/sales-persons/${id}/`);
    // return response.json();

    return {
      id,
      name: "John Kamau",
      email: "john@sales.com",
      referral_code: "KAMAU001",
      commission_rate: 10,
      is_active: true,
      created_at: "2024-01-15",
      total_referrals: 15,
      approved_referrals: 12,
      paid_referrals: 8,
      total_earnings: 45000,
    };
  },

  getSalesPersonStats: async (id: string): Promise<SalesStats> => {
    // const response = await fetch(`${API_BASE_URL}/sales-persons/${id}/stats/`);
    // return response.json();

    return {
      total_referrals: 15,
      pending_referrals: 3,
      approved_referrals: 4,
      confirmed_referrals: 8,
      rejected_referrals: 0,
      total_earnings: 45000,
      total_revenue: 450000,
    };
  },

  // Referral endpoints
  getAllReferrals: async (status?: string): Promise<Referral[]> => {
    // let url = `${API_BASE_URL}/referrals/`;
    // if (status) url += `?status=${status}`;
    // const response = await fetch(url);
    // return response.json();

    return [
      {
        id: "1",
        sales_person: "1",
        sales_person_name: "John Kamau",
        sales_person_code: "KAMAU001",
        client_name: "Peter Ochieng",
        client_email: "peter@client.com",
        client_phone: "+254734567890",
        status: "confirmed",
        referral_code_used: "KAMAU001",
        payment_amount: 5000,
        commission_earned: 500,
        payment_received_at: "2024-11-20",
        created_at: "2024-11-15",
        updated_at: "2024-11-20",
      },
      {
        id: "2",
        sales_person: "1",
        sales_person_name: "John Kamau",
        sales_person_code: "KAMAU001",
        client_name: "Jane Wanjiku",
        client_email: "jane@client.com",
        status: "approved",
        referral_code_used: "KAMAU001",
        created_at: "2024-11-25",
        updated_at: "2024-11-26",
      },
    ];
  },

  getReferralsByPerson: async (
    salesPersonId: string,
    status?: string
  ): Promise<Referral[]> => {
    // let url = `${API_BASE_URL}/sales-persons/${salesPersonId}/referrals/`;
    // if (status) url += `?status=${status}`;
    // const response = await fetch(url);
    // return response.json();

    return [];
  },

  createReferral: async (data: Partial<Referral>): Promise<Referral> => {
    // const response = await fetch(`${API_BASE_URL}/referrals/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data),
    // });
    // return response.json();

    return data as Referral;
  },

  approveReferral: async (id: string): Promise<Referral> => {
    // const response = await fetch(`${API_BASE_URL}/referrals/${id}/approve/`, {
    //   method: 'POST',
    // });
    // return response.json();

    return {} as Referral;
  },

  rejectReferral: async (id: string, reason: string): Promise<Referral> => {
    // const response = await fetch(`${API_BASE_URL}/referrals/${id}/reject/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ reason }),
    // });
    // return response.json();

    return {} as Referral;
  },

  recordPayment: async (
    id: string,
    paymentData: {
      amount: number;
      payment_id: string;
      payment_method: string;
    }
  ): Promise<Referral> => {
    // const response = await fetch(`${API_BASE_URL}/referrals/${id}/record_payment/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(paymentData),
    // });
    // return response.json();

    return {} as Referral;
  },

  verifyReferralCode: async (
    code: string
  ): Promise<{
    valid: boolean;
    sales_person?: { id: string; name: string; code: string };
  }> => {
    // const response = await fetch(`${API_BASE_URL}/referrals/verify_code/`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ code }),
    // });
    // return response.json();

    return {
      valid: true,
      sales_person: { id: "1", name: "John Kamau", code: "KAMAU001" },
    };
  },

  // Admin dashboard endpoints
  getAdminOverview: async (): Promise<AdminOverview> => {
    // const response = await fetch(`${API_BASE_URL}/admin-dashboard/overview/`);
    // return response.json();

    return {
      total_sales_people: 15,
      total_referrals: 120,
      pending_referrals: 25,
      approved_referrals: 35,
      confirmed_referrals: 55,
      total_revenue: 2750000,
      total_commissions: 275000,
    };
  },

  getLeaderboard: async (): Promise<SalesPerson[]> => {
    // const response = await fetch(`${API_BASE_URL}/admin-dashboard/leaderboard/`);
    // return response.json();

    return [
      {
        id: "2",
        name: "Mary Njeri",
        email: "mary@sales.com",
        referral_code: "NJERI002",
        commission_rate: 12,
        is_active: true,
        created_at: "2024-02-20",
        total_referrals: 23,
        approved_referrals: 20,
        paid_referrals: 15,
        total_earnings: 78000,
      },
      {
        id: "1",
        name: "John Kamau",
        email: "john@sales.com",
        referral_code: "KAMAU001",
        commission_rate: 10,
        is_active: true,
        created_at: "2024-01-15",
        total_referrals: 15,
        approved_referrals: 12,
        paid_referrals: 8,
        total_earnings: 45000,
      },
    ];
  },
};
