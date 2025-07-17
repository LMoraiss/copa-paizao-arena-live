import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const playerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  jersey_number: z.number().min(1, 'Número deve ser maior que 0').max(99, 'Número deve ser menor que 100'),
  position: z.enum(['goalkeeper', 'defender', 'midfielder', 'forward'], {
    required_error: 'Posição é obrigatória',
  }),
  photo_url: z.string().url().optional().or(z.literal('')),
  team_id: z.string().uuid('Selecione um time'),
});

type PlayerFormData = z.infer<typeof playerSchema>;

interface Team {
  id: string;
  name: string;
}

interface CreatePlayerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const positions = [
  { value: 'goalkeeper', label: 'Goleiro' },
  { value: 'defender', label: 'Defensor' },
  { value: 'midfielder', label: 'Meio-campo' },
  { value: 'forward', label: 'Atacante' },
];

export const CreatePlayerForm: React.FC<CreatePlayerFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
  });

  const selectedPosition = watch('position');
  const selectedTeam = watch('team_id');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao carregar times.',
          variant: 'destructive',
        });
        return;
      }

      setTeams(data || []);
    } catch (error) {
      console.error('Unexpected error fetching teams:', error);
    } finally {
      setLoadingTeams(false);
    }
  };

  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('players')
        .insert([{
          name: data.name,
          jersey_number: data.jersey_number,
          position: data.position,
          photo_url: data.photo_url || null,
          team_id: data.team_id,
        }]);

      if (error) {
        console.error('Error creating player:', error);
        if (error.code === '23505') {
          toast({
            title: 'Erro',
            description: 'Já existe um jogador com este número neste time.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erro',
            description: 'Falha ao criar jogador. Verifique se você tem permissão de administrador.',
            variant: 'destructive',
          });
        }
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Jogador criado com sucesso!',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar jogador.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Novo Jogador</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome do Jogador *</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Vinicius Jr."
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="jersey_number">Número da Camisa *</Label>
            <Input
              id="jersey_number"
              type="number"
              min="1"
              max="99"
              {...register('jersey_number', { valueAsNumber: true })}
              placeholder="Ex: 10"
            />
            {errors.jersey_number && (
              <p className="text-sm text-destructive mt-1">{errors.jersey_number.message}</p>
            )}
          </div>

          <div>
            <Label>Posição *</Label>
            <Select onValueChange={(value) => setValue('position', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma posição" />
              </SelectTrigger>
              <SelectContent>
                {positions.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.position && (
              <p className="text-sm text-destructive mt-1">{errors.position.message}</p>
            )}
          </div>

          <div>
            <Label>Time *</Label>
            <Select onValueChange={(value) => setValue('team_id', value)} disabled={loadingTeams}>
              <SelectTrigger>
                <SelectValue placeholder={loadingTeams ? "Carregando times..." : "Selecione um time"} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.team_id && (
              <p className="text-sm text-destructive mt-1">{errors.team_id.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="photo_url">URL da Foto</Label>
            <Input
              id="photo_url"
              {...register('photo_url')}
              placeholder="https://exemplo.com/foto.jpg"
            />
            {errors.photo_url && (
              <p className="text-sm text-destructive mt-1">{errors.photo_url.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || loadingTeams || teams.length === 0} 
              className="flex-1"
            >
              {isSubmitting ? 'Criando...' : 'Criar Jogador'}
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