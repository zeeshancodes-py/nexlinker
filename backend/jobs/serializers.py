from rest_framework import serializers
from .models import Job, JobApplication
from accounts.serializers import UserSerializer


class JobSerializer(serializers.ModelSerializer):
    posted_by = UserSerializer(read_only=True)
    has_applied = serializers.SerializerMethodField()
    company_logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Job
        fields = '__all__'
        read_only_fields = ['posted_by']

    def get_has_applied(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return JobApplication.objects.filter(job=obj, applicant=request.user).exists()

    def get_company_logo_url(self, obj):
        request = self.context.get('request')
        if obj.company_logo and request:
            return request.build_absolute_uri(obj.company_logo.url)
        return None


class JobApplicationSerializer(serializers.ModelSerializer):
    applicant = UserSerializer(read_only=True)

    class Meta:
        model = JobApplication
        fields = '__all__'
        read_only_fields = ['applicant', 'status']