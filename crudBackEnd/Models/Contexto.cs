using Microsoft.EntityFrameworkCore;

namespace crudBackEnd.Models
{
    public class Contexto : DbContext{
        public DbSet<Financa> Financas { get; set; }

        public Contexto(DbContextOptions<Contexto> opcoes) : base(opcoes) 
        {
            
        }
    }
}