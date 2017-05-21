<?php
define('PHP_SELF', 'pixmicat.php');
define('DEBUG', TRUE);
$_SERVER['HTTP_HOST'] = '127.0.0.1';
require dirname(__FILE__).'/../../config.php';
require ROOTPATH.'lib/pmclibrary.php';
//require ROOTPATH.'vendor/autoload.php';
require ROOTPATH.'lib/lib_compatible.php'; // �ޤJ�ۮe�禡�w
require ROOTPATH.'lib/lib_common.php'; // �ޤJ�@�q�禡�ɮ�