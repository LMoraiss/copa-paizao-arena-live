import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const matchSchema = z.object({
  home_team_id: z.string().uuid('Selecione o time da casa'),
  away_team_id: z.string().uuid('Selecione o time visitante'),
  match_date: z.date({
    required_error: 'Data da partida é obrigatória',
  }),
  match_time: z.string().min(1, 'Horário é obrigatório'),
  location: z.string().optional(),
  stage: z.enum(['group_stage', 'semi_finals', 'final'], {
    required_error: 'Fase é obrigatória',
  }),
}).refine((data) => data.home_team_id !== data.away_team_id, {
  message: 'O time da casa deve ser diferente do time visitante',
  path: ['away_team_id'],
});

type MatchFormData = z.infer<typeof matchSchema>;

interface Team {
  id: string;
  name: string;
}

interface CreateMatchFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const stages = [
  { value: 'group_stage', label: 'Fase de Grupos' },
  { value: 'semi_finals', label: 'Semi-finais' },
  { value: 'final', label: 'Final' },
];

export const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onSuccess, onCancel }) => {
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
  } = useForm<MatchFormData>({
    resolver: zodResolver(matchSchema),
  });

  const selectedDate = watch('match_date');
  const selectedHomeTeam = watch('home_team_id');

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

  const onSubmit = async (data: MatchFormData) => {
    setIsSubmitting(true);
    
    try {
      // Combine date and time
      const [hours, minutes] = data.match_time.split(':').map(Number);
      const matchDateTime = new Date(data.match_date);
      matchDateTime.setHours(hours, minutes, 0, 0);

      const { error } = await supabase
        .from('matches')
        .insert([{
          home_team_id: data.home_team_id,
          away_team_id: data.away_team_id,
          match_date: matchDateTime.toISOString(),
          location: data.location || null,
          stage: data.stage,
        }]);

      if (error) {
        console.error('Error creating match:', error);
        toast({
          title: 'Erro',
          description: 'Falha ao criar partida. Verifique se você tem permissão de administrador.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Sucesso',
        description: 'Partida criada com sucesso!',
      });

      reset();
      onSuccess?.();
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao criar partida.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Criar Nova Partida</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label>Time da Casa *</Label>
            <Select onValueChange={(value) => setValue('home_team_id', value)} disabled={loadingTeams}>
              <SelectTrigger>
                <SelectValue placeholder={loadingTeams ? "Carregando times..." : "Selecione o time da casa"} />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.home_team_id && (
              <p className="text-sm text-destructive mt-1">{errors.home_team_id.message}</p>
            )}
          </div>

          <div>
            <Label>Time Visitante *</Label>
            <Select onValueChange={(value) => setValue('away_team_id', value)} disabled={loadingTeams}>
              <SelectTrigger>
                <SelectValue placeholder={loadingTeams ? "Carregando times..." : "Selecione o time visitante"} />
              </SelectTrigger>
              <SelectContent>
                {teams.filter(team => team.id !== selectedHomeTeam).map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.away_team_id && (
              <p className="text-sm text-destructive mt-1">{errors.away_team_id.message}</p>
            )}
          </div>

          <div>
            <Label>Data da Partida *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>Selecione uma data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('match_date', date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {errors.match_date && (
              <p className="text-sm text-destructive mt-1">{errors.match_date.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="match_time">Horário *</Label>
            <Input
              id="match_time"
              type="time"
              {...register('match_time')}
            />
            {errors.match_time && (
              <p className="text-sm text-destructive mt-1">{errors.match_time.message}</p>
            )}
          </div>

          <div>
            <Label>Fase *</Label>
            <Select onValueChange={(value) => setValue('stage', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a fase" />
              </SelectTrigger>
              <SelectContent>
                {stages.map((stage) => (
                  <SelectItem key={stage.value} value={stage.value}>
                    {stage.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.stage && (
              <p className="text-sm text-destructive mt-1">{errors.stage.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="Ex: Estádio Maracanã"
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || loadingTeams || teams.length < 2} 
              className="flex-1"
            >
              {isSubmitting ? 'Criando...' : 'Criar Partida'}
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