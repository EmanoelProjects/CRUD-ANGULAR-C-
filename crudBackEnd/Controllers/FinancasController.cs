using crudBackEnd.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace crudBackEnd.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FinancasController : ControllerBase
    {
        private readonly Contexto _contexto;

        public FinancasController(Contexto contexto)
        {
            _contexto = contexto;
        }


        [HttpGet("todas")]
        public async Task<ActionResult<IEnumerable<Financa>>> GetFinancas()
        {
            return await _contexto.Financas.ToListAsync();
        }

        [HttpGet]
        public async Task<ActionResult<object>> GetFinancasPorPag(
        int pageNumber = 1,
        int pageSize = 10,
        string descricao = "",
        string tipo = "",
        string startDate = "",
        string endDate = ""
    )
        {
            try
            {

                var financasQuery = _contexto.Financas.AsQueryable();


                if (!string.IsNullOrEmpty(descricao))
                {
                    financasQuery = financasQuery.Where(f => f.Descricao.ToLower().Contains(descricao.ToLower()));
                }


                if (!string.IsNullOrEmpty(tipo))
                {
                    financasQuery = financasQuery.Where(f => f.Tipo.ToLower() == tipo.ToLower());
                }


                if (!string.IsNullOrEmpty(startDate) && DateTime.TryParseExact(startDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out DateTime start))
                {
                    financasQuery = financasQuery.Where(f => f.Data >= start);
                }

                if (!string.IsNullOrEmpty(endDate) && DateTime.TryParseExact(endDate, "dd/MM/yyyy", null, System.Globalization.DateTimeStyles.None, out DateTime end))
                {
                    financasQuery = financasQuery.Where(f => f.Data <= end);
                }


                var totalRegistros = await financasQuery.CountAsync();


                var totalPages = (int)Math.Ceiling((double)totalRegistros / pageSize);


                if (pageNumber > totalPages && totalPages > 0)
                {
                    pageNumber = totalPages;
                }

                var paginatedFinancas = await financasQuery
                     .OrderByDescending(f => f.Id)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();


                return new { items = paginatedFinancas, totalRegistros };
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao processar a consulta", details = ex.Message });
            }
        }


        [HttpPost]
        public async Task<ActionResult<Financa>> Post(Financa financa)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            await _contexto.Financas.AddAsync(financa);
            await _contexto.SaveChangesAsync();

            return Ok(financa);
        }

        [HttpPut("{Id}")]
        public async Task<ActionResult<Financa>> Put(int Id, Financa financa)
        {



            var financaExistente = await _contexto.Financas.FindAsync(Id);
            if (financaExistente == null)
            {
                return NotFound($"Finança com ID {Id} não encontrada.");
            }

            financaExistente.Descricao = financa.Descricao;
            financaExistente.Valor = financa.Valor;
            financaExistente.Data = financa.Data;
            financaExistente.Tipo = financa.Tipo;


            await _contexto.SaveChangesAsync();


            return Ok(financaExistente);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFinanca(int id)
        {
            var financa = await _contexto.Financas.FindAsync(id);
            if (financa == null)
            {
                return NotFound();
            }

            _contexto.Financas.Remove(financa);
            await _contexto.SaveChangesAsync();


            return NoContent();
        }

    }
}