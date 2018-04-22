<?php
/* Simple script to upload a zip file to the webserver and have it unzipped
   Saves tons of time, think only of uploading Wordpress to the server
   Thanks to c.bavota (www.bavotasan.com)
   Modified by: Johan van de Merwe (12.02.2013)
   http://snipplr.com/view/69947/script-for-uploading-zip-file-and-unzip-it-on-the-server/
*/   
 
function rmdir_recursive($dir) {
    foreach(scandir($dir) as $file) {
       if ('.' === $file || '..' === $file) continue;
       if (is_dir("$dir/$file")) rmdir_recursive("$dir/$file");
       else unlink("$dir/$file");
   }
 
   rmdir($dir);
}
 
if($_FILES["zip_file"]["name"]) {
	$filename = $_FILES["zip_file"]["name"];
	$source = $_FILES["zip_file"]["tmp_name"];
	$type = $_FILES["zip_file"]["type"];
 
	$name = explode(".", $filename);
	$accepted_types = array('application/zip', 'application/x-zip-compressed', 'multipart/x-zip', 'application/x-compressed');
	foreach($accepted_types as $mime_type) {
		if($mime_type == $type) {
			$okay = true;
			break;
		} 
	}
 
	$continue = strtolower($name[1]) == 'zip' ? true : false;
	if(!$continue) {
		$message = "The file you are trying to upload is not a .zip file. Please try again.";
	}
 
	/* PHP current path */
	$path = $_POST['path']; // absolute path to the directory where zipper.php is in
	$filenoext = basename ($filename, '.zip');  // absolute path to the directory where zipper.php is in (lowercase)
	$filenoext = basename ($filenoext, '.ZIP');  // absolute path to the directory where zipper.php is in (when uppercase)
	
	$targetdir = $path . $filenoext; // target directory
	$targetzip = $path . $filename; // target zip file
	/* create directory if not exists', otherwise overwrite */
	/* target directory is same as filename without extension */
	
	if (is_dir($targetdir))  rmdir_recursive ( $targetdir);
	
	if (!is_dir($path)) {
		mkdir($path, 0777, true);
	}
	mkdir($targetdir, 0777);
	
	
	/* here it is really happening */
 
	if(move_uploaded_file($source, $targetzip)) {
		$zip = new ZipArchive();
		$x = $zip->open($targetzip);  // open the zip file to extract
		if ($x === true) {
			$zip->extractTo($targetdir); // place in the directory with same name  
			$zip->close();
 
			unlink($targetzip);
		}
		echo $targetdir;
		$message = "Your .zip file was uploaded and unpacked.";
	} else {
		echo '0';
		$message = "There was a problem with the upload. Please try again.";
	}
}
?>