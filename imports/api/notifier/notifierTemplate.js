export const notifierHTML = `
<div style="text-align: center;">
  <img align="none" src="https://gallery.mailchimp.com/301becd69e00afa63c21122f3/images/994c42eb-8752-4bd8-9def-bbdd1e96bf49.jpg" style="max-width: 500px; max-height: 168px; margin: 0px auto;" width="100%" />
</div>
&nbsp;
<div style="max-width: 500px; margin: 0px auto;">
  <font color="#505050" face="Open Sans', sans-serif" style="font-size: 16px; line-height:24px">
    {{greeting}}
  </font>
  <br />
  <br />
  <font color="#505050" face="Open Sans', sans-serif" style="font-size: 16px; line-height:24px">
    {{message}}
  </font>
  <br />
  <a href="{{url}}" style="text-decoration:none;">
    <div style="background-color:#00c091; color: #fff; padding: 15px; text-align:center; font-size:20px; border-radius:3px" face="Open Sans', sans-serif">
      {{action}}
    </div>
  </a>
  <br />
  <br />
  <font color="#505050" face="Open Sans', sans-serif" style="font-size: 16px; line-height:24px">
    {{farewell}}
  </font>
  <br />
  <br />
  <br />
  <img align="left" src="https://vote.democracy.earth/images/olive.png" style="max-width: 40px;">
  <br />
  <br />
  &nbsp;
</div>
`;
