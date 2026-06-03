export const clientWelcomeEmail = (contactPerson, companyName) => {
  // const baseUrl = "https://ccscompliance.in"; // use absolute URL
  const baseUrl = "https://taskmanagementportal-jkm0.onrender.com";
  
  return `
<table width="100%" cellpadding="0" cellspacing="0" 
  style="font-family: Arial, sans-serif; background-color:#f8f8f8; padding:20px;">
  
  <tr>
    <td>
      <table width="800" cellpadding="20" cellspacing="0" 
        style="background-color:#ffffff; border-radius:8px; margin:0 auto; text-align:left;">
        
        <tr>
          <td style="text-align:left;">

            <p>Dear ${contactPerson || "Sir/Madam"},</p>

            <p>
              Welcome to <strong>CCS - Contractor Compliance Services</strong>! 
              We are thrilled to have you on board and look forward to assisting 
              <strong>${companyName}</strong> with compliance documentation.
            </p>

            <p>
              We will guide you through each stage of the compliance process 
              to ensure smooth execution.
            </p>

            <p>
              Please find attached the introductory guide outlining our services and timeline.
            </p>

            <br/>

            <p>
              Compliance: +919558107027<br/>
              CCS Helpline: +916358937094<br/>
              CCS Landline: 02838297888
            </p>

            <img 
              src="${baseUrl}/ccslogo.png" 
              alt="CCS Logo"
              width="120"
              style="display:block; margin-top:10px;"
            />

            <br/>

            <p>
              For more details visit 
              <a href="https://www.ccsgroup.company">
                www.ccsgroup.company
              </a>
            </p>

          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
`;
};
