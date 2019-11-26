<!DOCTYPE html>
<html>
	<head>

		<title>Cloud View</title>

		<script type="application/javascript" src="https://code.jquery.com/jquery-1.12.4.min.js"></script>
		<script type="application/javascript" src="js/math.min.js"></script>
		<script type="application/javascript" src="js/cloudview.js"></script>

		<link rel="stylesheet" href="styles.css" />

	</head>
	<body>



		<div id="container" style="position: absolute; left: calc(50vw - 30vh); top:15vh; width:70vh; height: 70vh;">
			<svg class="lines-canvas" height="100%" width="100%"></svg>
		</div>

		<script type="application/javascript">

		var rootCloud;
		var rootWords = ["idée","progrès","réflexion","cohésion","simplicité","beauté","succès","travail","tentatives","itération","recommencement","exploration"];

		$(function() {

			rootCloud = new BSCloudView($("#container"));
			rootCloud.setCloudTags(rootWords);
			rootCloud.setup();

		});

		</script>

	</body>
</html>
