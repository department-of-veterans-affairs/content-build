---
# Page setup.
layout: page-breadcrumbs.html
template: detail-page

# The title of the tab.
title: Veterans Community Care Program Eligibility Tool

# The <h1> visible on the page
display_title: Veterans Community Care Program Eligibility Tool

# This line indicates that this page is not to be built to production (www.va.gov)
vagovprod: false
private: true
---

<div class="va-introtext" id="introtext">
Determine whether you may qualify to receive care from a third-party provider through the Veterans Community Care Program by telling us where you live and the type of health care you're seeking. Contact your primary care physician for any questions about your care.
</div>
<div class="feature" id="eligibility-result" style="display:none">
	<h3><div id="result" style="display:none"></div></h3>
</div>
<div id="loading" style="display:none">
	<div class="vads-u-display--flex vads-u-justify-content--center vads-u-padding-y--5">
		<img src="https://prod-va-gov-assets.s3-us-gov-west-1.amazonaws.com/img/loading-state.svg" alt="Loading-Gif">
	</div>
</div>
<form id="address_form" name="address_form">
<label>Street Address:</label><input type="text" name="street" required autocomplete="address-line1" />
<label>City:</label><input type="text" name="city" required autocomplete="address-level2" />
<label>State:</label><select name="state" required autocomplete="address-level1" >
<option value="AL">
AL
</option>

<option value="AK">
AK
</option>

<option value="AR">
AR
</option>

<option value="AS">
AS
</option>

<option value="AZ">
AZ
</option>

<option value="CA">
CA
</option>

<option value="CO">
CO
</option>

<option value="CT">
CT
</option>

<option value="DC">
DC
</option>

<option value="DE">
DE
</option>

<option value="FL">
FL
</option>

<option value="GA">
GA
</option>

<option value="GU">
GU
</option>

<option value="HI">
HI
</option>

<option value="IA">
IA
</option>

<option value="ID">
ID
</option>

<option value="IL">
IL
</option>

<option value="IN">
IN
</option>

<option value="KS">
KS
</option>

<option value="KY">
KY
</option>

<option value="LA">
LA
</option>

<option value="MA">
MA
</option>

<option value="MD">
MD
</option>

<option value="ME">
ME
</option>

<option value="MI">
MI
</option>

<option value="MN">
MN
</option>

<option value="MO">
MO
</option>

<option value="MP">
MP
</option>

<option value="MS">
MS
</option>

<option value="MT">
MT
</option>

<option value="NC">
NC
</option>

<option value="NE">
NE
</option>

<option value="NH">
NH
</option>

<option value="NJ">
NJ
</option>

<option value="NM">
NM
</option>

<option value="NV">
NV
</option>

<option value="NY">
NY
</option>

<option value="ND">
ND
</option>

<option value="OH">
OH
</option>

<option value="OK">
OK
</option>

<option value="OR">
OR
</option>

<option value="PA">
PA
</option>

<option value="PR">
PR
</option>

<option value="RI">
RI
</option>

<option value="SC">
SC
</option>

<option value="SD">
SD
</option>

<option value="TN">
TN
</option>

<option value="TX">
TX
</option>

<option value="UM">
UM
</option>

<option value="UT">
UT
</option>

<option value="VT">
VT
</option>

<option value="VA">
VA
</option>

<option value="VI">
VI
</option>

<option value="WA">
WA
</option>

<option value="WI">
WI
</option>

<option value="WV">
WV
</option>

<option value="WY">
WY
</option>
</select>
<label>Zip:</label><input type="text" name="postal" required autocomplete="postal-code" />
<label>Care Type:</label><select name="care_type" required>
<option value="primary">
Primary Care
</option>

<option value="mental">
Mental Health Care
</option>

<option value="extended">
Non-Institutional Extended Care
</option>

<option value="other">
Other
</option>
</select>
<input type="submit" value="Submit" />
</form>
<script src="https://veteligibilitystatus.com/js/jquery-3.3.1.min.js" type="text/javascript"></script>
<script type="text/javascript">
$('#address_form').submit(function(e) {
		e.preventDefault();
		var data = {};
		var Form = this;
		$.each(this.elements, function(i, v) {
			var input = $(v);
			data[input.attr("name")] = input.val();
			delete data["undefined"];
		});
		$.ajax({
			type: 'POST',
			url: 'https://veteligibilitystatus.com/eligibility',
			dataType: 'json',
			contentType: 'application/json; charset=utf-8',
			data: JSON.stringify(data),
			context: Form,
			success: function(callback) {
			console.log(callback);
			if (callback.eligible) {
				$(this).text('')
				$("#result").append(callback.message)
			}
			else {
				$(this).text('')
				$("#result").append(callback.message)
			}
		},
		error: function() {
			$(this).text('')
			$("#result").append("Based on the information you provided, we were unable to determine your eligibility for the Veterans Community Care Program. Contact your primary care physician for more information.");
		}
		});
	});
</script>
<div class="usa-width-two-thirds medium-8 columns">
	<div class="help-footer-box"><h2 class="help-heading">Need help?</h2>
		<div><p class="help-talk">Enrollment or Eligibility questions:</p>
		<p class="help-phone-number">
		<a class="help-phone-number-link" href="tel:+1-877-222-8387">1-877-222-8387</a>
		<br>TTY: <a class="help-phone-number-link" href="tel:+18008778339">1-800-877-8339</a>
		<br>Monday – Friday, 8:00 a.m. – 8:00 p.m. (ET)</p><p class="help-talk">If this form isn't working right for you, please <span>call us at <a href="tel:18555747286">1-855-574-7286</a>.
		<br>If you have hearing loss, call TTY: 711.</span></p>
		</div><p class="help-talk">To report a problem with this form,<br>please <span>call us at <a href="tel:18555747286">1-855-574-7286</a>.
		<br>If you have hearing loss, call TTY: 711.</span></p>
	</div>
</div>
<script language="javascript" type="text/javascript">
$(document).ready(function () {
    $(document).ajaxStart(function () {
        $("#loading").show();
		$("#address_form").hide();
    }).ajaxStop(function () {
        $("#loading").hide();
	$("#address_form").show();
	$("#introtext").hide();
	$("#eligibility-result").show();
	$("#result").show();
    });
});
</script>
