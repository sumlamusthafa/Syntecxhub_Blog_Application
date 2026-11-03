import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Home from "./pages/Home.jsx";
import PostPage from "./pages/PostPage.jsx";
const Editor = lazy(() => import("./pages/Editor.jsx"));
import MyPosts from "./pages/MyPosts.jsx";

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="screen-center" role="status">
          Loading…
        </div>
      }
    >
      <AppRoutes />
    </Suspense>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/posts/:id" element={<PostPage />} />
        <Route
          path="/write"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posts/:id/edit"
          element={
            <ProtectedRoute>
              <Editor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-posts"
          element={
            <ProtectedRoute>
              <MyPosts />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
