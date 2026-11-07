# Portfolio implementation brief

## Owner

- Display name: Asen Mayuranga Wijesiri
- Professional focus: Software Engineer
- Location: Colombo, Sri Lanka
- GitHub: https://github.com/AshenMayuranga
- LinkedIn: https://www.linkedin.com/in/ashen-mayuranga-33a1a431a/
- Email: ashen.ayuranga@gmail.com
- Mobile: +94 76 989 5035

Contact details were verified against the header and email link in `docs/Asen_Mayuranga_Wijesiri_Software_Engineer_CV.pdf` and are displayed in the website's contact section.

## Professional background

Final-year BSc (Hons) Information Technology undergraduate at SLIIT. The supplied CV lists a Software Engineering Internship with the Inventory Team at Information Systems Associates (Pvt) Ltd from July 2025 to May 2026.

Experience includes Java/Spring Boot backend services, React/TypeScript frontend modules, gRPC, Hibernate/HQL, Kafka, PostgreSQL, Couchbase, production bug fixes, security fixes, refactoring, and unit testing.

The newly supplied CV lists undergraduate studies in 2022–2026 and expected graduation in March 2027. The website now reflects those dates without claiming a completed qualification.

## Selected projects

### GreenSweep — Smart Waste Management

Final-year research project. The owner's component is a Flutter collection app with resident, driver, and administrator roles, adaptive route optimisation, live driver location, and a Cloudflare Workers backend integrated with Firebase.

Repository: https://github.com/AshenMayuranga/R26-IT-126

### Pharmacy Management System

Spring Boot microservices with Spring Cloud Gateway, Eureka, Kafka, PostgreSQL, and a React/TypeScript frontend.

Repository: https://github.com/AshenMayuranga/pharmacy-management-system

### LankaCart

E-commerce MVP with user, product, order, and inventory services, an API gateway, aggregated Swagger documentation, and a React/TypeScript frontend.

Repository: https://github.com/AshenMayuranga/LankaCart

### PocketPulse

Group personal-finance project. The owner's contributions include income and expense management, interactive charts, and a What-If Scenario Planner.

Repository: https://github.com/AshenMayuranga/Pocket_Pulse

### EduJourney

Group learning and social platform. The owner's contributions include post management and backend-generated notifications secured with JWT and OAuth 2.0.

Repository: https://github.com/AshenMayuranga/Edu_Journey

## Agreed implementation direction

- Build a static HTML/CSS/JavaScript portfolio for GitHub Pages.
- Use Three.js for an interactive 3D character.
- Character behaviours: greeting wave, idle motion, cursor tracking, and a click reaction.
- Keep professional content readable independently of the avatar.
- Support mobile screens, keyboard navigation, and reduced motion.

## Assets still to select

- The 3D character and its animation source, including permission to redistribute any third-party assets.
- Project screenshots or other supplied visual material.
- The supplied CV is available through the website's Download CV button.

No third-party character model or project screenshot has been added. The supplied CV PDF is stored in `docs/Asen_Mayuranga_Wijesiri_Software_Engineer_CV.pdf` as a source for the professional information and contact details.

## First implementation

- The first version uses an original procedural Three.js robot, with a matching SVG fallback, rather than a third-party character model.
- Project visuals are original explanatory diagrams, not screenshots of the applications.
- The site includes all five projects, project filters, experience, skills, education, and email/phone/LinkedIn/GitHub contact links.
- The education copy uses the study period and expected graduation date from the supplied CV.
- Source files and locally vendored Three.js modules work directly on GitHub Pages; `npm run build` also creates a separate static `dist/` output.

## Final local preparation

- The footer shows a build-generated Last updated date and time in Asia/Colombo (UTC+05:30), fixed across visits and visitor timezones.
- The hero includes a downloadable copy of the supplied CV.
- The character uses a minified bundle; fonts are self-hosted with their licenses.
- Metadata includes a PNG sharing image, social card fields, and factual profile structured data.
- Git setup, publishing, and final address-dependent metadata are deferred until the owner is ready.
