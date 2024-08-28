<?php

namespace CIStore\Utils;

function user_has_access()
{
    return user_has_expert_access() || get_user_meta(get_current_user_id(), 'ci_store_access', true) == 1;
}

function user_has_expert_access()
{
    return get_user_meta(get_current_user_id(), 'ci_store_expert_access', true) == 1;
}
