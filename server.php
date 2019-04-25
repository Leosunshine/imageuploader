<?php
	$files = $_FILES;
	$file = $files['fileInput'];
	$tmp_name = $file['tmp_name'];
	move_uploaded_file($tmp_name, $file['name']);
	echo $file['name'];