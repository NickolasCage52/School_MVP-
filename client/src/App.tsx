import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NetworkBanner } from "./components/NetworkBanner";
import { ErrorBoundary } from "./components/ErrorBoundary";

const Catalog = lazy(() => import("./pages/Catalog").then((m) => ({ default: m.Catalog })));
const Program = lazy(() => import("./pages/Program").then((m) => ({ default: m.Program })));
const LeadForm = lazy(() => import("./pages/LeadForm").then((m) => ({ default: m.LeadForm })));
const Success = lazy(() => import("./pages/Success").then((m) => ({ default: m.Success })));
const Admin = lazy(() => import("./pages/Admin").then((m) => ({ default: m.Admin })));

function PageLoader() {
  return (
    <div className="page-bg flex min-h-screen items-center justify-center bg-tg-bg font-sans">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-tg-button border-t-transparent" aria-hidden />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <NetworkBanner />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/program/:id" element={<Program />} />
            <Route path="/lead/:id" element={<LeadForm />} />
            <Route path="/lead/:id/success" element={<Success />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
