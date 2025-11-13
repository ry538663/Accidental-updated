# hospital_structured_models.py
# Django-style models for multi-tenant hospital project (concise)

from django.db import models
from django.core.validators import MinValueValidator, RegexValidator
from django.contrib.auth.models import AbstractUser
from django.conf import settings

class Hospital(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField()
    phone = models.CharField(
        max_length=15,
        validators=[
            RegexValidator(
                regex=r'^\+?1?\d{9,15}$',
                message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
            )
        ]
    )
    email = models.EmailField(unique=True)
    subscription_plan = models.CharField(
        max_length=20,
        choices=[('basic','Basic'),('premium','Premium'),('enterprise','Enterprise')],
        default='basic'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'hospitals'
        verbose_name = 'Hospital'
        verbose_name_plural = 'Hospitals'

    def __str__(self):
        return self.name

class CustomUser(AbstractUser):
    hospital = models.ForeignKey(
        Hospital,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='users',
        help_text="Hospital this user belongs to. Leave empty for superusers."
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    role = models.CharField(max_length=20, choices=[('admin','Hospital Admin'),('doctor','Doctor'),('nurse','Nurse'),('receptionist','Receptionist'),('staff','General Staff')], default='staff')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.username} ({self.hospital.name if self.hospital else 'Superuser'})"

class Patient(models.Model):
    GENDER_CHOICES = [('M','Male'),('F','Female'),('O','Other')]
    BLOOD_GROUP_CHOICES = [('A+','A+'),('A-','A-'),('B+','B+'),('B-','B-'),('AB+','AB+'),('AB-','AB-'),('O+','O+'),('O-','O-')]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='patients')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, blank=True)
    phone = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    address = models.TextField()
    emergency_contact_name = models.CharField(max_length=200, blank=True)
    emergency_contact_phone = models.CharField(max_length=15, blank=True)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'patients'
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        unique_together = ['hospital', 'phone']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.hospital.name})"

class Doctor(models.Model):
    SPECIALIZATION_CHOICES = [
        ('cardiology','Cardiology'),('neurology','Neurology'),('orthopedics','Orthopedics'),('pediatrics','Pediatrics'),('emergency','Emergency Medicine'),('general','General Medicine')
    ]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors')
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATION_CHOICES)
    license_number = models.CharField(max_length=50, unique=True)
    experience_years = models.PositiveIntegerField(default=0)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    education = models.TextField()
    certifications = models.TextField(blank=True)
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_available = models.BooleanField(default=True, db_index=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'doctors'
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'
        unique_together = ['hospital', 'license_number']
        ordering = ['first_name', 'last_name']

    def __str__(self):
        return f"Dr. {self.first_name} {self.last_name} ({self.hospital.name})"

class Bed(models.Model):
    BED_TYPE_CHOICES = [('general','General'),('icu','ICU'),('emergency','Emergency'),('pediatric','Pediatric'),('private','Private')]

    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='beds')
    bed_number = models.CharField(max_length=50)
    bed_type = models.CharField(max_length=20, choices=BED_TYPE_CHOICES, default='general')
    is_occupied = models.BooleanField(default=False)
    is_reserved_for_incident = models.BooleanField(default=False, db_index=True)
    reserved_incident_id = models.IntegerField(null=True, blank=True)
    reserved_expiry_time = models.DateTimeField(null=True, blank=True)
    severity_level = models.CharField(max_length=20, default='medium')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['hospital', 'bed_number']
        ordering = ['bed_type', 'bed_number']

    def __str__(self):
        return f"{self.hospital.name} - {self.bed_type} #{self.bed_number}"

class EmergencyIncident(models.Model):
    incident_id = models.IntegerField(unique=True, db_index=True)
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='emergency_incidents')
    patient_condition = models.JSONField(null=True, blank=True)
    ambulance_id = models.CharField(max_length=50, null=True, blank=True, db_index=True)
    status = models.CharField(max_length=50, default='incoming', db_index=True)
    arrival_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'emergency_incidents'