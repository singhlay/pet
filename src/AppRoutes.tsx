import React, {useEffect} from "react";
import { Routes, Route } from "react-router-dom";
import { PetsPage } from "./pages/PetsPage";
import { PetProfile } from "./pages/PetProfile";
import { PetMatching } from "./pages/PetMatching";
import { HomePage } from "./pages/HomePage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { AuthCallback } from "./pages/AuthCallback";
import { PrivateRoute } from "./components/auth/PrivateRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <UserProfilePage />
          </PrivateRoute>
        }
      />
      <Route
        path="/pets/:id"
        element={
          <PrivateRoute>
            <PetProfile />
          </PrivateRoute>
        }
      />
      <Route
        path="/matching"
        element={
          <PrivateRoute>
            <PetMatching />
          </PrivateRoute>
        }
      />
      <Route
        path="/pets"
        element={
          <PrivateRoute>
            <PetsPage />
          </PrivateRoute>
        }
      />
      {/* External Redirects Using the Reusable Component */}
      <Route path="/products" element={<ExternalRedirect url="https://www.tiltingheads.com/" />} />
      <Route path="/blog" element={<ExternalRedirect url="https://www.tiltingheads.com/blogs/latest-blogs" />} />
      <Route path="/contact" element={<ExternalRedirect url="https://www.tiltingheads.com/pages/contact" />} />
    </Routes>
  );
}

const ExternalRedirect = ({ url }: { url: string }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);
  return null;
};