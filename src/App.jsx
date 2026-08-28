import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import "./App.css";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Classes from "./components/Classes";
import Features from "./components/Features";
import Contact from "./components/Contact";
import Testimonials from "./components/Testimonials";
import Footer from "./Footer/Footer.jsx";
import ScienceBackground from "./components/ScienceBackground";

import StudentDashboard from "./pages/StudentDashboard";
import Courses from "./pages/student/MyCourses.jsx";
import Homeworks from "./pages/student/MyHomework.jsx";
import Exams from "./pages/student/MyExams.jsx";
import CoursePlayer from "./pages/student/CoursePlayer";
import ExamPlayer from "./pages/student/ExamPlayer.jsx";
import ExamResult from "./pages/student/ExamResult";
import MyResults from "./pages/student/MyResults";
import Profile from "./pages/student/Profile";


import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherProfile from "./pages/teacher/TeacherProfile.jsx";
import ManageCourses from "./pages/teacher/ManageCourses";
import ManageHomework from "./pages/teacher/ManageHomework";
import ManageExams from "./pages/teacher/ManageExams";
import ExamQuestions from "./pages/teacher/ExamQuestions";
import EssayReview from "./pages/teacher/EssayReview";
import EssayCorrection from "./pages/teacher/EssayCorrection";
import TeacherExamResults from "./pages/teacher/TeacherExamResults";
import TeacherStudentResult from "./pages/teacher/TeacherStudentResult";
import TeacherStudents from "./pages/teacher/TeacherStudents";
import StudentRequests from "./pages/teacher/TeacherPendingStudents.jsx";


import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AuthPage from "./pages/AuthPage";
import EmailVerification from "./pages/EmailVerification";


function AppLayout() {
  const location = useLocation();

  const path = location.pathname;

const shouldHideNavbar =
  // Auth
  path === "/auth" ||

  // Email Verification
  path === "/verify-email" ||

  // كل صفحات الطالب
  path.startsWith("/class/") ||

  // تشغيل الكورس
  path.startsWith("/course/") ||

  // حل الامتحان
  path.startsWith("/exam/") ||

  // كل صفحات المدرس
  path.startsWith("/teacher");
  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      <Routes>

        {/* =========================================
            HOME
        ========================================= */}

        <Route
          path="/"
          element={
            <>

              {/* =====================================
                  HERO
              ===================================== */}

              <section
                id="home"
                className="home-section"
              >

                <ScienceBackground variant="hero" />

                <div className="home-content">
                  <Hero />
                </div>

              </section>


              {/* =====================================
                  FEATURES
              ===================================== */}

              <section
                id="features"
                className="features-section"
              >

                <ScienceBackground variant="features" />

                <div className="features-content">
                  <Features />
                </div>

              </section>


              {/* =====================================
                  CLASSES
              ===================================== */}

              <section
                id="classes"
                className="classes-section"
              >

                <ScienceBackground variant="classes" />

                <div className="classes-content">
                  <Classes />
                </div>

              </section>


              {/* =====================================
                  TESTIMONIALS
              ===================================== */}

              <section
                id="testimonials"
                className="testimonials-section"
              >

                <ScienceBackground variant="default" />

                <div className="testimonials-content">
                  <Testimonials />
                </div>

              </section>


              {/* =====================================
                  CONTACT
              ===================================== */}

              <section
                id="contact"
                className="contact-section"
              >

                <ScienceBackground variant="contact" />

                <div className="contact-content">
                  <Contact />
                </div>

              </section>

              <Footer />

            </>
          }
        />


        {/* =========================================
            AUTH
        ========================================= */}

        <Route
          path="/auth"
          element={<AuthPage />}
        />


        {/* =========================================
            EMAIL VERIFICATION
        ========================================= */}

        <Route
          path="/verify-email"
          element={<EmailVerification />}
        />


        {/* =========================================
            STUDENT DASHBOARD
        ========================================= */}

        <Route
          path="/class/:grade"
          element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            STUDENT COURSES
        ========================================= */}

        <Route
          path="/class/:grade/courses"
          element={
            <ProtectedRoute>
              <Courses />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            STUDENT HOMEWORK
        ========================================= */}

        <Route
          path="/class/:grade/homeworks"
          element={
            <ProtectedRoute>
              <Homeworks />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            STUDENT EXAMS
        ========================================= */}

        <Route
          path="/class/:grade/exams"
          element={
            <ProtectedRoute>
              <Exams />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            COURSE PLAYER
        ========================================= */}

        <Route
          path="/course/:id"
          element={
            <RoleRoute role="student">
              <CoursePlayer />
            </RoleRoute>
          }
        />


        {/* =========================================
            EXAM PLAYER
        ========================================= */}

        <Route
          path="/exam/:examId"
          element={
            <RoleRoute role="student">
              <ExamPlayer />
            </RoleRoute>
          }
        />


        {/* =========================================
            EXAM RESULT
        ========================================= */}

        <Route
          path="/exam-result/:examId"
          element={
            <ProtectedRoute>
              <ExamResult />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            MY RESULTS
        ========================================= */}

        <Route
          path="/class/:grade/my-results"
          element={
            <ProtectedRoute>
              <MyResults />
            </ProtectedRoute>
          }
        />


        {/* =========================================
            STUDENT PROFILE
        ========================================= */}

        <Route
          path="/class/:grade/profile"
          element={
            <Profile />
          }
        />


        {/* =========================================
            TEACHER DASHBOARD
        ========================================= */}

        <Route
          path="/teacher"
          element={
            <RoleRoute role="teacher">
              <TeacherDashboard />
            </RoleRoute>
          }
        />


        {/* =========================================
            TEACHER PROFILE
        ========================================= */}

        <Route
          path="/teacher/profile"
          element={
            <RoleRoute role="teacher">
              <TeacherProfile />
            </RoleRoute>
          }
        />


        {/* =========================================
            MANAGE COURSES
        ========================================= */}

        <Route
          path="/teacher/courses"
          element={
            <RoleRoute role="teacher">
              <ManageCourses />
            </RoleRoute>
          }
        />


        {/* =========================================
            MANAGE HOMEWORK
        ========================================= */}

        <Route
          path="/teacher/homework"
          element={
            <RoleRoute role="teacher">
              <ManageHomework />
            </RoleRoute>
          }
        />


        {/* =========================================
            MANAGE EXAMS
        ========================================= */}

        <Route
          path="/teacher/exams"
          element={
            <RoleRoute role="teacher">
              <ManageExams />
            </RoleRoute>
          }
        />


        {/* =========================================
            ESSAY REVIEW
        ========================================= */}

        <Route
          path="/teacher/essay-review"
          element={
            <RoleRoute role="teacher">
              <EssayReview />
            </RoleRoute>
          }
        />


        {/* =========================================
            ESSAY CORRECTION
        ========================================= */}

        <Route
          path="/teacher/essay-correction/:attemptId"
          element={
            <RoleRoute role="teacher">
              <EssayCorrection />
            </RoleRoute>
          }
        />


        {/* =========================================
            EXAM QUESTIONS
        ========================================= */}

        <Route
          path="/teacher/exams/:examId/questions"
          element={
            <ExamQuestions />
          }
        />


        {/* =========================================
            TEACHER EXAM RESULTS
        ========================================= */}

        <Route
          path="/teacher/exam-results/:examId"
          element={
            <TeacherExamResults />
          }
        />


        {/* =========================================
            TEACHER STUDENT RESULT
        ========================================= */}

        <Route
          path="/teacher/student-result/:attemptId"
          element={
            <TeacherStudentResult />
          }
        />


        {/* =========================================
            TEACHER STUDENTS
        ========================================= */}

        <Route
          path="/teacher/students"
          element={
            <TeacherStudents />
          }
        />


        {/* =========================================
            TEACHER VIEW STUDENT DASHBOARD
        ========================================= */}

        <Route
          path="/teacher/students/:studentId/dashboard"
          element={
            <StudentDashboard />
          }
        />

        {/* =========================================
            TEACHER PENDING STUDENTS
        ========================================= */}

        <Route
          path="/teacher/pending-students"
          element={
            <RoleRoute role="teacher">
              <StudentRequests />
            </RoleRoute>
          }
        />




      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;