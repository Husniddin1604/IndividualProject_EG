from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    phone_number = models.CharField(_('phone number'), max_length=20, blank=True)
    address = models.TextField(_('address'), blank=True)
    preferred_language = models.CharField(
        _('preferred language'),
        max_length=2,
        choices=[('ru', 'Русский'), ('en', 'English'), ('uz', 'Oʻzbek')],
        default='ru'
    )
    is_organizer = models.BooleanField(_('is organizer'), default=False)

    def __str__(self):
        return self.username

class Venue(models.Model):
    name = models.CharField(_('name'), max_length=255)
    address = models.TextField(_('address'))
    city = models.CharField(_('city'), max_length=100)
    country = models.CharField(_('country'), max_length=100)
    capacity = models.PositiveIntegerField(_('capacity'), default=0)
    seating_chart = models.JSONField(_('seating chart'), blank=True, null=True)  # Для схемы мест

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('venue')
        verbose_name_plural = _('venues')

class Category(models.Model):
    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('category')
        verbose_name_plural = _('categories')

class Organizer(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organizations')
    name = models.CharField(_('name'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    logo = models.ImageField(_('logo'), upload_to='organizers/', blank=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = _('organizer')
        verbose_name_plural = _('organizers')

class Event(models.Model):
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    date = models.DateTimeField(_('event date'))
    venue = models.ForeignKey(Venue, on_delete=models.CASCADE, related_name='events')
    categories = models.ManyToManyField(Category, related_name='events')
    organizer = models.ForeignKey(Organizer, on_delete=models.CASCADE, related_name='events')
    image = models.ImageField(_('image'), upload_to='events/', blank=True)
    status = models.CharField(
        _('status'),
        max_length=20,
        choices=[('active', 'Active'), ('cancelled', 'Cancelled'), ('postponed', 'Postponed')],
        default='active'
    )
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('event')
        verbose_name_plural = _('events')

class Ticket(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    ticket_type = models.CharField(
        _('ticket type'),
        max_length=50,
        choices=[('standard', 'Standard'), ('vip', 'VIP'), ('child', 'Child')],
        default='standard'
    )
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    sector = models.CharField(_('sector'), max_length=50, blank=True)
    row = models.CharField(_('row'), max_length=10, blank=True)
    seat_number = models.CharField(_('seat number'), max_length=10, blank=True)
    is_sold = models.BooleanField(_('is sold'), default=False)
    reserved_until = models.DateTimeField(_('reserved until'), null=True, blank=True)
    qr_code = models.CharField(_('QR code'), max_length=100, unique=True, blank=True)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    def __str__(self):
        return f"{self.event.title} - {self.ticket_type} - {self.seat_number or 'No seat'}"

    class Meta:
        verbose_name = _('ticket')
        verbose_name_plural = _('tickets')

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    tickets = models.ManyToManyField(Ticket, related_name='purchases')
    total_amount = models.DecimalField(_('total amount'), max_digits=12, decimal_places=2)
    purchase_date = models.DateTimeField(_('purchase date'), auto_now_add=True)
    payment_status = models.CharField(
        _('payment status'),
        max_length=20,
        choices=[('pending', 'Pending'), ('completed', 'Completed'), ('failed', 'Failed')],
        default='pending'
    )
    payment_method = models.CharField(
        _('payment method'),
        max_length=20,
        choices=[('payme', 'Payme'), ('stripe', 'Stripe')],
        blank=True
    )
    delivery_method = models.CharField(
        _('delivery method'),
        max_length=20,
        choices=[('electronic', 'Electronic'), ('physical', 'Physical')],
        default='electronic'
    )

    def __str__(self):
        return f"{self.user.username} - Purchase #{self.id}"

    class Meta:
        verbose_name = _('purchase')
        verbose_name_plural = _('purchases')