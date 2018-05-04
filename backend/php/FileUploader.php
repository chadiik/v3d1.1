<?php

    $path = '../'.$_POST['path'].'/';

    if (!is_dir($path)) {
		mkdir($path, 0777, true);
	}
    
    if ( !!$_FILES['file']['tmp_name'] ) {
        if ( move_uploaded_file( $_FILES['file']['tmp_name'], $path . basename($_FILES['file']['name'] ) ) )
        {
            echo '1';
        }
        else {
            echo '0';
        }
    }
    else{
        echo '0';
    }
?>