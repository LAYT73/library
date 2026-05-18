import React from 'react';
import { Form, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, PasswordInput } from '../../shared/ui/Input';
import { useLogin } from '../../shared/hooks/useAuth';
import { useAuthStore } from '../../shared/lib/store';

const loginSchema = z.object({
  email: z.email('Неверный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
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
      message.success('Вход выполнен');
      onSuccess?.();
    } catch {
      message.error('Не удалось войти');
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
            <Input {...field} placeholder="Введите email" type="email" />
          </Form.Item>
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field, fieldState }) => (
          <Form.Item
            label="Пароль"
            validateStatus={fieldState.error ? 'error' : ''}
            help={fieldState.error?.message}
          >
            <PasswordInput {...field} placeholder="Введите пароль" />
          </Form.Item>
        )}
      />

      <Button
        type="primary"
        htmlType="submit"
        loading={loginMutation.isPending}
        block
      >
        Войти
      </Button>
    </Form>
  );
};
