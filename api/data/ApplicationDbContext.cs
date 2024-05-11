using api.model;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace api.data;

public class ApplicationDbContext : IdentityDbContext<AppUser>
{
	public ApplicationDbContext(DbContextOptions options) : base(options)
	{
	}
	
	public DbSet<Event> Events { get; set; }
	public DbSet<TicketType> TicketTypes { get; set; }
	public DbSet<Ticket> Tickets { get; set; }
	public DbSet<Permission> Permissions { get; set; }
	
	protected override void OnModelCreating(ModelBuilder builder)
	{
		base.OnModelCreating(builder);
		
		builder.Entity<Permission>(x => x.HasKey(p => new { p.AppUserId, p.EventId }));
		builder.Entity<Permission>()
			.HasOne(p => p.AppUser)
			.WithMany(u => u.Permissions)
			.HasForeignKey(p => p.AppUserId);
		builder.Entity<Permission>()
			.HasOne(p => p.Event)
			.WithMany(u => u.Permissions)
			.HasForeignKey(p => p.EventId);
		
		List<IdentityRole> roles =
		[
			new IdentityRole
			{
				Name = "Admin",
				NormalizedName = "ADMIN"
			},

			new IdentityRole
			{
				Name = "User",
				NormalizedName = "USER"
			}

		];
		builder.Entity<IdentityRole>().HasData(roles);
		
	}
}