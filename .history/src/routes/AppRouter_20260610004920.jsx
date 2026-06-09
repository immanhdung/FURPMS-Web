import { BrowserRouter, Routes, Route } from "react-router-dom";

function LoginPage() {
  return <h1>Login</h1>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
      </Routes>
    </BrowserRouter>
  );
}