from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Job, JobApplication
from .serializers import JobSerializer, JobApplicationSerializer


class JobListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer

    def get_queryset(self):
        qs = Job.objects.filter(is_active=True)
        q = self.request.query_params.get('q')
        job_type = self.request.query_params.get('job_type')
        location = self.request.query_params.get('location')
        if q:
            qs = qs.filter(title__icontains=q) | qs.filter(company__icontains=q)
        if job_type:
            qs = qs.filter(job_type=job_type)
        if location:
            qs = qs.filter(location__icontains=location)
        return qs

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)


class JobDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer
    queryset = Job.objects.all()


class ApplyJobView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, job_id):
        job = get_object_or_404(Job, id=job_id)
        if JobApplication.objects.filter(job=job, applicant=request.user).exists():
            return Response({'error': 'Already applied.'}, status=400)
        cover_letter = request.data.get('cover_letter', '')
        application = JobApplication.objects.create(
            job=job, applicant=request.user, cover_letter=cover_letter
        )
        return Response(JobApplicationSerializer(application).data, status=201)


class MyApplicationsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobApplicationSerializer

    def get_queryset(self):
        return JobApplication.objects.filter(applicant=self.request.user)


class SavedJobsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = JobSerializer

    def get_queryset(self):
        # Extend with SavedJob model if needed
        return Job.objects.none()