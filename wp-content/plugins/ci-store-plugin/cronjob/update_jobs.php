<?php

function update_jobs($jobs)
{
    update_option('ci_store_jobs', $jobs);
    return $jobs;
}
