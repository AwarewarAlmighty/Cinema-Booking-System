import React from 'react';
import { Link } from 'react-router-dom';

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-bold mb-4 text-green-400">Email Verified ✅</h1>
      <p className="text-slate-300 mb-6">
        Your email has been successfully verified. You can now log in to your account.
      </p>
      <Link to="/login" className="btn btn-primary px-4 py-2">
        Go to Login
      </Link>
    </div>
  );
}
