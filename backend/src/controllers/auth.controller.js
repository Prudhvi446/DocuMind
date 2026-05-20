const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const prisma = require("../lib/prisma.js");
const { env } = require("../config/env.js");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function signToken(tenant) {
  return jwt.sign(
    { tenantId: tenant.id, email: tenant.email },
    env.JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function tenantResponse(tenant) {
  return {
    id: tenant.id,
    email: tenant.email,
    name: tenant.name,
    queryLimit: tenant.queryLimit,
  };
}

async function register(req, res, next) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.tenant.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        error: "Email already registered",
        code: "EMAIL_EXISTS",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const tenant = await prisma.tenant.create({
      data: {
        email,
        passwordHash,
        name,
        queryLimit: 1000,
        monthlyCount: 0,
      },
    });

    const token = signToken(tenant);
    res.status(201).json({ token, tenant: tenantResponse(tenant) });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Validation failed",
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsed.data;
    const tenant = await prisma.tenant.findUnique({ where: { email } });

    if (!tenant || !(await bcrypt.compare(password, tenant.passwordHash))) {
      return res.status(401).json({
        error: "Invalid credentials",
        code: "INVALID_CREDENTIALS",
      });
    }

    const token = signToken(tenant);
    res.json({ token, tenant: tenantResponse(tenant) });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.tenantId },
    });

    if (!tenant) {
      return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
    }

    res.json({
      id: tenant.id,
      email: tenant.email,
      name: tenant.name,
      queryLimit: tenant.queryLimit,
      monthlyCount: tenant.monthlyCount,
      queryCount: tenant.queryCount,
      createdAt: tenant.createdAt,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
