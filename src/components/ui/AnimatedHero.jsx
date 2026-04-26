import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "./ShadcnButton";

function AnimatedHero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["asombroso", "nuevo", "maravilloso", "hermoso", "inteligente"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 py-20 lg:py-40 items-center justify-center">
          
          {/* Left Column: Content */}
          <div className="flex gap-8 flex-col items-start text-left">
            <div>
              <Button variant="secondary" size="sm" className="gap-4">
                Leer nuestro artículo de lanzamiento <MoveRight className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="flex gap-4 flex-col">
              <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-left font-regular">
                <span className="text-zinc-900 dark:text-zinc-50">Esto es algo</span>
                <span className="relative flex w-full justify-start overflow-hidden text-left md:pb-4 md:pt-1">
                  &nbsp;
                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute font-semibold text-[var(--mango)]"
                      initial={{ opacity: 0, y: "-100" }}
                      transition={{ type: "spring", stiffness: 50 }}
                      animate={
                        titleNumber === index
                          ? {
                              y: 0,
                              opacity: 1,
                            }
                          : {
                              y: titleNumber > index ? -150 : 150,
                              opacity: 0,
                            }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-left dark:text-zinc-400">
                Administrar un pequeño negocio hoy ya es lo suficientemente duro. Evita más
                complicaciones dejando atrás métodos obsoletos y tediosos. Nuestro objetivo
                es simplificar el comercio para PyMEs, haciéndolo más fácil y rápido que nunca.
              </p>
            </div>
            
            <div className="flex flex-row gap-3">
              <Button size="lg" className="gap-4 text-zinc-900 dark:text-zinc-50" variant="outline">
                Agendar llamada <PhoneCall className="w-4 h-4" />
              </Button>
              <Button size="lg" className="gap-4 bg-[var(--mango-dark)] hover:bg-[var(--mango)] text-white border-0">
                Registrate acá <MoveRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Column: Image Asset */}
          <div className="relative hidden lg:block rounded-3xl overflow-hidden shadow-2xl border border-zinc-100 dark:border-white/10">
            <div className="absolute inset-0 bg-gradient-to-tr from-[var(--mango)]/20 to-transparent mix-blend-overlay z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Manguito Dashboard Mockup" 
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-700 ease-out"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

export { AnimatedHero };
