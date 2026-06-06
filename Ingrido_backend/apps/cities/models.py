# apps/cities/models.py
from django.db import models

class City(models.Model):
    name = models.CharField(max_length=100, unique=True)
    region = models.CharField(max_length=100)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_pandamart_available = models.BooleanField(default=False)
    image = models.ImageField(upload_to='city_images/', blank=True, null=True)

    def __str__(self):
        return self.name