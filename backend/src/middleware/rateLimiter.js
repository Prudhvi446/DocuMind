const prisma = require("../lib/prisma.js");

function getNextMonthReset() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}

async function rateLimiter(req, res, next) {
  let tenant = await prisma.tenant.findUnique({
    where: { id: req.tenantId },
  });

  if (!tenant) {
    return res.status(401).json({ error: "Unauthorized", code: "AUTH_REQUIRED" });
  }

  const now = new Date();
  const reset = new Date(tenant.monthlyResetAt);
  if (
    reset.getMonth() !== now.getMonth() ||
    reset.getFullYear() !== now.getFullYear()
  ) {
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { monthlyCount: 0, monthlyResetAt: now },
    });
  }

  if (tenant.monthlyCount >= tenant.queryLimit) {
    return res.status(429).json({
      error: "Monthly query limit reached",
      code: "RATE_LIMIT_EXCEEDED",
      limit: tenant.queryLimit,
      used: tenant.monthlyCount,
      resetsAt: getNextMonthReset().toISOString(),
    });
  }

  req.tenant = tenant;
  next();
}

module.exports = { rateLimiter };
