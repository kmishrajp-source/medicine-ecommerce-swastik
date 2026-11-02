const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app', '[locale]', 'healthmart', 'provider', 'dashboard', 'page.js');
let code = fs.readFileSync(filePath, 'utf8');

const target1 = `  useEffect(() => {
    fetchOpportunities();
  }, []);`;

const repl1 = `  useEffect(() => {
    fetchOpportunities();
    if (session?.user) {
      if (session.user.name) {
        setBusinessName(session.user.name);
        setContactName(session.user.name);
      }
      if (session.user.email && !session.user.email.includes('@swastik.com')) {
        setEmail(session.user.email);
      }
    }
  }, [session]);`;

const normCode = code.replace(/\r\n/g, '\n');
const normTarget = target1.replace(/\r\n/g, '\n');
let updated = normCode.replace(normTarget, repl1);
updated = updated.replace('providerId: "sp-eq-001",', 'providerId: session?.user?.id || "sp-eq-001",');
updated = updated.replace('providerType: "SUPPLIER",', 'providerType: session?.user?.role || "SUPPLIER",');

fs.writeFileSync(filePath, updated, 'utf8');
console.log('Provider dashboard multi-tenancy updated!');

