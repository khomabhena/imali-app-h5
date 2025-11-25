/**
 * PasswordStrength Component
 * Mobile app style password strength indicator
 */
export default function PasswordStrength({ password }) {
  if (!password) return null;

  const getPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
    
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const messages = {
      0: '',
      1: 'Weak! Please add more strength!',
      2: 'Fair! Keep going!',
      3: 'Good! Almost there!',
      4: 'Strong password!',
      5: 'Very strong password!',
    };
    return { strength, label: labels[strength], message: messages[strength] };
  };

  const { strength, label, message } = getPasswordStrength(password);

  return (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${
            strength <= 2
              ? 'bg-red-500'
              : strength <= 3
              ? 'bg-yellow-500'
              : 'bg-teal-500'
          }`}
          style={{ width: `${(strength / 5) * 100}%` }}
        />
      </div>
      {strength <= 2 && (
        <p className="text-xs text-gray-500">{message}</p>
      )}
    </div>
  );
}

