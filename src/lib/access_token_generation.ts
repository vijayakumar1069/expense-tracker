export async function gettingAccessToken({ ClientId, ClientSecret, TenantID }:{
    ClientId: string,
    ClientSecret: string,
    TenantID: string,
}) {
    try {
      const t = await fetch(
        `https://login.microsoftonline.com/${TenantID}/oauth2/v2.0/token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `grant_type=client_credentials&client_id=${ClientId}&client_secret=${ClientSecret}&scope=https://graph.microsoft.com/.default`,
        }
      ).then((res) => res.json());
  
      return {
        status: 200,
        message: t,
        error: false,
      };
    } catch (error) {
      console.log(error);
      return {
        status: 400,
        message: "Error getting access token",
        error: true,
      };
    }
  }