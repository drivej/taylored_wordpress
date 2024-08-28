<?php

namespace CIStore\Hooks;

function add_custom_access_checkbox($user)
{
    ?>
    <h3>CI Store Access</h3>
    <table class="form-table">
        <tr>
            <th><label for="ci_store_access">Access CI Store</label></th>
            <td>
                <input type="checkbox" name="ci_store_access" id="ci_store_access" value="1" <?php checked(1, get_user_meta($user->ID, 'ci_store_access', true), true);?> />
                <span class="description">Check this box to grant access to the CI Store.</span>
            </td>
        </tr>
        <tr>
            <th><label for="ci_store_access">Expert Access CI Store</label></th>
            <td>
                <input type="checkbox" name="ci_store_expert_access" id="ci_store_expert_access" value="1" <?php checked(1, get_user_meta($user->ID, 'ci_store_expert_access', true), true);?> />
                <span class="description">Check this box to grant expert access to the CI Store.</span>
            </td>
        </tr>
    </table>
    <?php
}

function save_custom_access_checkbox($user_id)
{
    if (!current_user_can('edit_user', $user_id)) {
        return false;
    }

    update_user_meta($user_id, 'ci_store_access', isset($_POST['ci_store_access']) ? 1 : 0);
    update_user_meta($user_id, 'ci_store_expert_access', isset($_POST['ci_store_expert_access']) ? 1 : 0);
}

// add_action('show_user_profile', [$this, 'add_custom_access_checkbox']);
// add_action('edit_user_profile', [$this, 'add_custom_access_checkbox']);