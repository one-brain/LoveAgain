import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../store/authApi';

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    roles: ['Seeker', 'Provider'] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const [register, { isLoading }] = useRegisterMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      validationErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      validationErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      validationErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = 'Enter a valid email address';
    }
    if (!formData.password) {
      validationErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      validationErrors.password = 'Use at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      validationErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        roles: ['Seeker', 'Provider']
      }).unwrap();
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors({ submit: 'Could not create account. Try again.' });
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Left side: Visual moment */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16"
        style={{ backgroundColor: '#E8773D' }}
      >
        <div>
          <h2
            className="text-4xl font-semibold mb-4"
            style={{ color: '#FFFFFF', lineHeight: '1.3', maxWidth: '480px' }}
          >
            Share experiences. Learn new skills. Make connections.
          </h2>
          <p
            className="text-lg"
            style={{ color: 'rgba(255, 255, 255, 0.9)', maxWidth: '440px', lineHeight: '1.6' }}
          >
            Join thousands finding companions for activities, from tennis matches to cooking classes to museum visits.
          </p>
        </div>
      </div>

      {/* Right side: Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <h1
            className="text-4xl font-semibold mb-2"
            style={{ color: '#1A1614', lineHeight: '1.2' }}
          >
            Create account
          </h1>
          <p className="mb-8" style={{ color: '#746B66' }}>
            Already a member?{' '}
            <Link
              to="/login"
              className="font-medium hover:underline"
              style={{ color: '#E8773D' }}
            >
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#1A1614' }}
                >
                  First name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                  style={{
                    borderColor: errors.firstName ? '#D14343' : '#E7E3E0',
                    color: '#1A1614',
                  }}
                  onFocus={(e) => !errors.firstName && (e.target.style.borderColor = '#E8773D')}
                  onBlur={(e) => !errors.firstName && (e.target.style.borderColor = '#E7E3E0')}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs" style={{ color: '#D14343' }}>
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium mb-2"
                  style={{ color: '#1A1614' }}
                >
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                  style={{
                    borderColor: errors.lastName ? '#D14343' : '#E7E3E0',
                    color: '#1A1614',
                  }}
                  onFocus={(e) => !errors.lastName && (e.target.style.borderColor = '#E8773D')}
                  onBlur={(e) => !errors.lastName && (e.target.style.borderColor = '#E7E3E0')}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs" style={{ color: '#D14343' }}>
                    {errors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: '#1A1614' }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                style={{
                  borderColor: errors.email ? '#D14343' : '#E7E3E0',
                  color: '#1A1614',
                }}
                onFocus={(e) => !errors.email && (e.target.style.borderColor = '#E8773D')}
                onBlur={(e) => !errors.email && (e.target.style.borderColor = '#E7E3E0')}
              />
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: '#D14343' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: '#1A1614' }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                style={{
                  borderColor: errors.password ? '#D14343' : '#E7E3E0',
                  color: '#1A1614',
                }}
                onFocus={(e) => !errors.password && (e.target.style.borderColor = '#E8773D')}
                onBlur={(e) => !errors.password && (e.target.style.borderColor = '#E7E3E0')}
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: '#D14343' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-2"
                style={{ color: '#1A1614' }}
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none"
                style={{
                  borderColor: errors.confirmPassword ? '#D14343' : '#E7E3E0',
                  color: '#1A1614',
                }}
                onFocus={(e) => !errors.confirmPassword && (e.target.style.borderColor = '#E8773D')}
                onBlur={(e) => !errors.confirmPassword && (e.target.style.borderColor = '#E7E3E0')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs" style={{ color: '#D14343' }}>
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {errors.submit && (
              <div
                className="px-4 py-3 rounded-lg text-sm"
                style={{ backgroundColor: '#FEF3F3', color: '#D14343' }}
              >
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#E8773D',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#C65D28')}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E8773D'}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-xs" style={{ color: '#746B66', lineHeight: '1.6' }}>
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="underline" style={{ color: '#746B66' }}>
              Terms
            </Link>
            {' and '}
            <Link to="/privacy" className="underline" style={{ color: '#746B66' }}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
