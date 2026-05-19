import React from 'react';
import { Form, Button, message } from 'antd';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input, PasswordInput } from '../../shared/ui/Input';
import { useRegister } from '../../shared/hooks/useAuth';
import { useAuthStore } from '../../shared/lib/store';
import { registerSchema, type RegisterFormData, maskPersonName } from '../../shared/validation';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const { control, handleSubmit } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
    },
  });

  const registerMutation = useRegister();
  const { login } = useAuthStore();

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const response = await registerMutation.mutateAsync(data);
      login(response);
      message.success('Регистрация выполнена');
      onSuccess?.();
    } catch {
      message.error('Не удалось зарегистрироваться');
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
        name="fullName"
        control={control}
        render={({ field, fieldState }) => (
          <Form.Item
            label="ФИО"
            validateStatus={fieldState.error ? 'error' : ''}
            help={fieldState.error?.message}
          >
            <Input
              {...field}
              placeholder="Введите ФИО"
              onChange={(e) => field.onChange(maskPersonName(e.target.value))}
            />
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
        loading={registerMutation.isPending}
        block
      >
        Зарегистрироваться
      </Button>
    </Form>
  );
};
