from django.urls import path
from .views import (
    MyProfileView, ProfileDetailView,
    ExperienceListCreateView, ExperienceDetailView,
    EducationListCreateView, EducationDetailView,
    SkillListCreateView, SkillDetailView,
    CertificationListCreateView, CertificationDetailView,
)

urlpatterns = [
    path('me/', MyProfileView.as_view(), name='my_profile'),
    path('<uuid:user_id>/', ProfileDetailView.as_view(), name='profile_detail'),
    path('experiences/', ExperienceListCreateView.as_view(), name='experiences'),
    path('experiences/<int:pk>/', ExperienceDetailView.as_view(), name='experience_detail'),
    path('educations/', EducationListCreateView.as_view(), name='educations'),
    path('educations/<int:pk>/', EducationDetailView.as_view(), name='education_detail'),
    path('skills/', SkillListCreateView.as_view(), name='skills'),
    path('skills/<int:pk>/', SkillDetailView.as_view(), name='skill_detail'),
    path('certifications/', CertificationListCreateView.as_view(), name='certifications'),
    path('certifications/<int:pk>/', CertificationDetailView.as_view(), name='certification_detail'),
]