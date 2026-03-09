from django.urls import path
from .views import JobListCreateView, JobDetailView, ApplyJobView, MyApplicationsView

urlpatterns = [
    path('', JobListCreateView.as_view(), name='jobs'),
    path('<int:pk>/', JobDetailView.as_view(), name='job_detail'),
    path('<int:job_id>/apply/', ApplyJobView.as_view(), name='apply_job'),
    path('my-applications/', MyApplicationsView.as_view(), name='my_applications'),
]