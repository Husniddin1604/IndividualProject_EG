from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    email = models.EmailField(_('email address'), unique=True)
    preferred_language = models.CharField(
        _('preferred language'),
        max_length=2,
        choices=[('ru', 'Русский'), ('en', 'English'), ('uz', 'Oʻzbek')],
        default='ru'
    )

    def __str__(self):
        return self.username

class Event(models.Model):
    title = models.CharField(_('title'), max_length=255)
    description = models.TextField(_('description'), blank=True)
    date = models.DateTimeField(_('event date'))
    location = models.CharField(_('location'), max_length=255)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = _('event')
        verbose_name_plural = _('events')

class Ticket(models.Model):
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='tickets')
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    seat_number = models.CharField(_('seat number'), max_length=10, blank=True)
    is_sold = models.BooleanField(_('is sold'), default=False)
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)

    def __str__(self):
        return f"{self.event.title} - {self.seat_number or 'No seat'}"

    class Meta:
        verbose_name = _('ticket')
        verbose_name_plural = _('tickets')

class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='purchases')
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

    def __str__(self):
        return f"{self.user.username} - {self.ticket}"

    class Meta:
        verbose_name = _('purchase')
        verbose_name_plural = _('purchases')