// Simple test to verify lens-helpers imports work
try {
  const { IncidentAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ IncidentAuditHelpers imported successfully');

  const { RiskAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ RiskAuditHelpers imported successfully');

  const { AssetAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ AssetAuditHelpers imported successfully');

  const { AIActAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ AIActAuditHelpers imported successfully');

  const { GDPRAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ GDPRAuditHelpers imported successfully');

  const { TPRMAuditHelpers } = require('./lib/audit/lens-helpers.ts');
  console.log('✅ TPRMAuditHelpers imported successfully');

  console.log('\n🎉 All lens-helpers imports work correctly!');
} catch (error) {
  console.error('❌ Import test failed:', error.message);
}
