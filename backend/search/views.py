from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from profiles.models import Profile
from profiles.serializers import ProfileListSerializer
from jobs.models import Job
from jobs.serializers import JobSerializer

User = get_user_model()


class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'people')

        if not q:
            return Response({'results': [], 'type': search_type})

        if search_type == 'people':
            profiles = Profile.objects.filter(
                user__first_name__icontains=q
            ) | Profile.objects.filter(
                user__last_name__icontains=q
            ) | Profile.objects.filter(
                headline__icontains=q
            ) | Profile.objects.filter(
                location__icontains=q
            )
            profiles = profiles.distinct().exclude(user=request.user)
            serializer = ProfileListSerializer(profiles[:20], many=True, context={'request': request})
            return Response({'results': serializer.data, 'type': search_type})

        elif search_type == 'jobs':
            jobs = Job.objects.filter(
                title__icontains=q
            ) | Job.objects.filter(
                company__icontains=q
            ) | Job.objects.filter(
                description__icontains=q
            )
            jobs = jobs.filter(is_active=True).distinct()
            serializer = JobSerializer(jobs[:20], many=True, context={'request': request})
            return Response({'results': serializer.data, 'type': search_type})

        return Response({'results': [], 'type': search_type})