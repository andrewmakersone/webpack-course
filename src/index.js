import * as $ from 'jquery';
import Post from "@/post";
// import json from './assets/json'
// import xml from './assets/data.xml'
import WebpackLogo from '@/assets/webpack-logo.png'
import './styles/styles.css'

const post = new Post('Webpack Post Title', WebpackLogo);

$('pre').html(post.toString()).addClass('code');

// console.log('JSON:', json);
// console.log('XML:', xml);
