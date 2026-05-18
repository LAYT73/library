import React from 'react';
import { Form, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, PasswordInput } from '../../shared/ui/Input';
import { useLogin } from '../../shared/hooks/useAuth';
import { useAuthStore } from '../../shared/lib/store';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { control, handleSubmit } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useLogin();
  const { login } = useAuthStore();

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      login(response);
      message.success('Login successful');
      onSuccess?.();
    } catch {
      message.error('Login failed');
    }
  };

  return (
    <Form onFinish={handleSubmit(onSubmit)} layout="vertical">
      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Form.Item
            label="Email"
            validateStatus={fieldState.error ? 'error' : ''}
            help={fieldState.error?.message}
          >
            <Input {...field} placeholder="Enter your email" type="email" />
          </Form.Item>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Form.Item
            label="Password"
            validateStatus={fieldState.error ? 'error' : ''}
            help={fieldState.error?.message}
          >
            <PasswordInput {...field} placeholder="Enter your password" />
          </Form.Item>
        )}
      />

      <Button
        type="primary"
        htmlType="submit"
        loading={loginMutation.isPending}
        block
      >
        Login
      </Button>
    </Form>
  );
};
