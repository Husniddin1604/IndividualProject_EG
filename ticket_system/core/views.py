from django.shortcuts import render
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, login, logout
from django.core.exceptions import ValidationError
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import User, Venue, Category, Organizer, Event, Ticket, Purchase
from .serializers import (
    VenueSerializer, CategorySerializer, OrganizerSerializer,
    EventSerializer, TicketSerializer, PurchaseSerializer, UserSerializer
)
import logging

logger = logging.getLogger('core')

def home(request):
    # Fetch active events
    events = Event.objects.filter(status='active').select_related('venue').order_by('date')
    context = {
        'events': events,
    }
    return render(request, 'core/home.html', context)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):
    try:
        user = request.user
        serializer = UserSerializer(user)
        logger.debug(f'Fetched user profile for {user.username}: {serializer.data}')
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f'Error fetching user profile: {str(e)}')
        return Response({'message': 'Failed to fetch user profile'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        phone_number = request.data.get('phone_number')
        address = request.data.get('address')
        preferred_language = request.data.get('preferred_language')

        if not all([username, email, password, phone_number, address]):
            logger.warning(f'Registration attempt with missing fields: {request.data}')
            return Response({'message': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            logger.warning(f'Registration attempt with existing username: {username}')
            return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            logger.warning(f'Registration attempt with existing email: {email}')
            return Response({'message': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            phone_number=phone_number,
            address=address,
            preferred_language=preferred_language
        )

        logger.info(f'User registered successfully: {username}')
        return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        logger.error(f'Registration error: {str(e)}')
        return Response({'message': 'Registration failed'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    try:
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            logger.warning(f'Login attempt without username or password: {request.data}')
            return Response({'message': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        logger.debug(f'Login attempt with username: {username}, password: [HIDDEN]')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            logger.info(f'User logged in successfully: {username}')
            return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
        else:
            logger.warning(f'Authentication failed for username: {username}')
            return Response({'message': 'Authentication failed'}, status=status.HTTP_401_UNAUTHORIZED)
    except Exception as e:
        logger.error(f'Login error: {str(e)}')
        return Response({'message': f'Login error: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        logout(request)
        logger.info(f'User logged out: {request.user.username}')
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f'Logout error: {str(e)}')
        return Response({'message': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    try:
        token = get_token(request)
        logger.debug('CSRF token generated')
        return JsonResponse({'csrfToken': token})
    except Exception as e:
        logger.error(f'CSRF token error: {str(e)}')
        return JsonResponse({'message': 'Failed to generate CSRF token'}, status=400)

@api_view(['GET'])
@permission_classes([AllowAny])
def verify_session(request):
    try:
        is_valid = request.user.is_authenticated
        logger.debug(f'Session verification: is_valid={is_valid}')
        return Response({'isValid': is_valid}, status=status.HTTP_200_OK)
    except Exception as e:
        logger.error(f'Session verification error: {str(e)}')
        return Response({'isValid': False}, status=status.HTTP_400_BAD_REQUEST)

class VenueViewSet(viewsets.ModelViewSet):
    queryset = Venue.objects.all()
    serializer_class = VenueSerializer
    permission_classes = [AllowAny]

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

class OrganizerViewSet(viewsets.ModelViewSet):
    queryset = Organizer.objects.all()
    serializer_class = OrganizerSerializer
    permission_classes = [AllowAny]

class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            logger.debug(f'Retrieved event {instance.id}: {serializer.data}')
            return Response(serializer.data)
        except Exception as e:
            logger.error(f'Error retrieving event {kwargs.get("pk")}: {str(e)}')
            return Response({'detail': 'Event not found'}, status=status.HTTP_404_NOT_FOUND)

class TicketViewSet(viewsets.ModelViewSet):
    queryset = Ticket.objects.filter(is_sold=False)
    serializer_class = TicketSerializer
    permission_classes = [AllowAny]

    def perform_update(self, serializer):
        ticket = self.get_object()
        if ticket.is_sold:
            logger.warning(f'Attempt to update sold ticket: {ticket.id}')
            raise ValidationError('This ticket is already sold.')
        serializer.save()

class PurchaseViewSet(viewsets.ModelViewSet):
    queryset = Purchase.objects.all()
    serializer_class = PurchaseSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        ticket_ids = self.request.data.get('tickets', [])
        tickets = Ticket.objects.filter(id__in=ticket_ids, is_sold=False)
        if len(tickets) != len(ticket_ids):
            logger.warning(f'Attempt to purchase unavailable tickets: {ticket_ids}')
            raise ValidationError('Some tickets are already sold or unavailable.')
        for ticket in tickets:
            ticket.is_sold = True
            ticket.save()
        serializer.save(user=self.request.user)