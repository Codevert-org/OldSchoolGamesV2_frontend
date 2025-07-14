<div class="box">
    <slot />
</div>

<style>
    .box {
        width: fit-content;
        margin: 20px auto;
        border: 11px solid green;
        border-image: url("./box_border.png") 11 stretch;
        border-radius: 12px;
        box-shadow: 3px 3px 6px #306b30;
    }
</style>