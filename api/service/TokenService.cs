﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using api.model;
using Microsoft.IdentityModel.Tokens;

namespace api.service;

public class TokenService : ITokenService
{
	private readonly IConfiguration _config;
	private readonly SymmetricSecurityKey _key;

	public TokenService(IConfiguration config)
	{
		_config = config;
		_key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:SigningKey"]));
	}
	public string CreateToken(AppUser user)
	{
		var claims = new List<Claim>
		{
			new Claim("userId", user.Id),
			new Claim(JwtRegisteredClaimNames.GivenName, user.UserName)
		};

		var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = DateTime.Now.AddDays(7),
			SigningCredentials = creds,
			Issuer = _config["JWT:Issuer"],
			Audience = _config["JWT:Audience"]
		};

		var tokenHandler = new JwtSecurityTokenHandler();

		var token = tokenHandler.CreateToken(tokenDescriptor);

		return tokenHandler.WriteToken(token);
	}

	public string CreateEventToken(AppUser user, Permission permission)
	{
		var claims = new List<Claim>
		{
			new Claim("userId", user.Id),
			new Claim(JwtRegisteredClaimNames.GivenName, user.UserName),
			new Claim("EventId", permission.EventId.ToString()),
			new Claim("PermissionType", permission.PermissionType.ToString())
		};

		var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = DateTime.Now.AddDays(7),
			SigningCredentials = creds,
			Issuer = _config["JWT:Issuer"],
			Audience = _config["JWT:Audience"]
		};

		var tokenHandler = new JwtSecurityTokenHandler();

		var token = tokenHandler.CreateToken(tokenDescriptor);

		return tokenHandler.WriteToken(token);
	}

	public string CreateSuperAdminEventToken(AppUser user, Event eventModel)
	{
		var claims = new List<Claim>
		{
			new Claim("userId", user.Id),
			new Claim(JwtRegisteredClaimNames.GivenName, user.UserName),
			new Claim("EventId", eventModel.Id.ToString()),
			new Claim("PermissionType", PermissionType.SuperAdmin.ToString())
		};

		var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);

		var tokenDescriptor = new SecurityTokenDescriptor
		{
			Subject = new ClaimsIdentity(claims),
			Expires = DateTime.Now.AddDays(7),
			SigningCredentials = creds,
			Issuer = _config["JWT:Issuer"],
			Audience = _config["JWT:Audience"]
		};

		var tokenHandler = new JwtSecurityTokenHandler();

		var token = tokenHandler.CreateToken(tokenDescriptor);

		return tokenHandler.WriteToken(token);
	}
}