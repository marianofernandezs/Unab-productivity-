import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Loader2 } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else {
        // En supabase si está desactivada la confirmación por email, ya inicia sesión. 
        // Navegamos al inicio. Si está activada, mostraría un mensaje de confirmación, 
        // pero por simplicidad navegaremos.
        navigate('/');
      }
    } catch (err: any) {
      setError('Ocurrió un error inesperado al registrar. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-card p-8 rounded-3xl shadow-2xl border border-border animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center transform -rotate-3">
            <UserPlus size={32} />
          </div>
        </div>
        
        <h2 className="text-3xl font-black text-center text-foreground mb-2">Crea tu cuenta</h2>
        <p className="text-center text-muted-foreground mb-8 font-medium">Únete a ProducApp y domina tu productividad.</p>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5 ml-1">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-foreground mb-1.5 ml-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none transition-shadow"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all hover:shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none mt-2"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-primary hover:underline font-bold">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
}
