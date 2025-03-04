<?php
    /**
     * The template for displaying vehicles.
     *
     * Template Name: All Vehicles
     *
     * @package storefront
     */

get_header('shop'); ?>

<div class="storefront-primary-content">
    <h1><?php the_title(); ?></h1>

    <?php
        // Determine current page for pagination
        $paged          = (get_query_var('paged')) ? get_query_var('paged') : 1;
        $terms_per_page = 12 * 20; // Number of terms per page
        $offset         = ($paged - 1) * $terms_per_page;

        // Get total number of terms for pagination
        $total_terms = wp_count_terms('product_vehicle', ['hide_empty' => true]);

        // Fetch terms for the current page
        $terms = get_terms([
            'taxonomy'   => 'product_vehicle',
            'hide_empty' => true,
            'fields'     => 'all', // Need 'all' for name, slug, count
            'number'     => $terms_per_page,
            'offset'     => $offset,
            'count'      => false, // Skip calculating counts for terms
        ]);

        if (! is_wp_error($terms) && ! empty($terms)) {
            echo '<ul style="column-width: 300px; column-gap: 40px;">';
            foreach ($terms as $term) {
                $term_link = get_term_link($term);
                if (! is_wp_error($term_link)) {
                    $product_count = $term->count;
                    echo '<li class="overflow-ellipsis">';
                    echo '<a class="fix hover-underline d-flex justify-content-between overflow-ellipsis" href="' . esc_url($term_link) . '">';
                    echo '<div class="overflow-ellipsis">' . esc_html($term->name) . '</div>';
                    echo '<div class="fw-light">(' . esc_html($product_count) . ')</div>';
                    echo '</a>';
                    echo '</li>';
                }
            }
            echo '</ul>';

            // Add pagination
            $total_pages = ceil($total_terms / $terms_per_page);
            echo '<div class="pagination">';
            echo paginate_links([
                'base'      => str_replace(999999999, '%#%', esc_url(get_pagenum_link(999999999))),
                'format'    => '?paged=%#%',
                'current'   => max(1, $paged),
                'total'     => $total_pages,
                'prev_text' => __('« Prev'),
                'next_text' => __('Next »'),
            ]);
            echo '</div>';
        } else {
            echo '<p>No vehicle terms found.</p>';
        }
    ?>
</div>

<?php
    // get_sidebar('shop');
get_footer('shop');
?>