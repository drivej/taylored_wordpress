<?php

function get_jobs()
{
    return array_values(get_option('ci_store_jobs', array()));
}
