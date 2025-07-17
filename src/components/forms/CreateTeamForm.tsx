import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const teamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  logo_url: z.string().url().optional().or(z.literal('')),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface CreateTeamFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  const onSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('teams')
        .insert([{
          name: data.name,
          logo_url: data.logo_url || null,
        }]);

      if (error) {
        console.error('Error creating team:', error);
        if (error.code === '23505') {
          toast({
            title: 'Erro',
            description: 'Já existe um time com este nome.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: 'Falha ao criar time. Verifique se você tem permissão de administrador.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Time criado com sucesso!',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar time.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Time</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Time *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Flamengo"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="logo_url">URL do Logo</Label>
            <Input
              id="logo_url"
              {...register('logo_url')}
              placeholder="https://exemplo.com/logo.png"
            />
            {errors.logo_url && (
              <p className="text-sm text-destructive mt-1">{errors.logo_url.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Criando...' : 'Criar Time'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};