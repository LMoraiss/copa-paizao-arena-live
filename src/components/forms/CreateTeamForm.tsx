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
import { Upload } from 'lucide-react';

const teamSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  logo_url: z.string().url().optional().or(z.literal('')),
  logo_file: z.any().optional(),
});

type TeamFormData = z.infer<typeof teamSchema>;

interface CreateTeamFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateTeamForm: React.FC<CreateTeamFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `team-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-logos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('team-logos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: TeamFormData) => {
    setIsSubmitting(true);
    
    try {
      let logoUrl = data.logo_url || null;

      // Upload image if file is selected
      if (selectedFile) {
        const uploadedUrl = await uploadImage(selectedFile);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from('teams')
        .insert([{
          name: data.name,
          logo_url: logoUrl,
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
      setSelectedFile(null);
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
            <Label htmlFor="logo_file">Logo da Equipe</Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  id="logo_file"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="flex-1"
                />
                <Upload className="w-4 h-4 text-gray-500" />
              </div>
              <div className="text-center text-sm text-gray-500">ou</div>
              <Input
                {...register('logo_url')}
                placeholder="Cole a URL de uma imagem"
                disabled={!!selectedFile}
              />
              {selectedFile && (
                <p className="text-sm text-green-600">Arquivo selecionado: {selectedFile.name}</p>
              )}
            </div>
            {errors.logo_url && (
              <p className="text-sm text-destructive mt-1">{errors.logo_url.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting || uploading} className="flex-1">
              {isSubmitting ? 'Criando...' : uploading ? 'Enviando imagem...' : 'Criar Time'}
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