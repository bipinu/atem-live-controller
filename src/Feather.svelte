<script>
  import feather from "feather-icons";
  export let icon = "feather";
  export let size = 24;
</script>

{@html feather.icons[icon].toSvg({width: size, height: size})}
